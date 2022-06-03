import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';
let supabase, editor;
let saved = false;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 2];
let seriesid = arr[arr.length - 3];

$('#btnSaveDraft').hide();
$('#btnPublish').hide();
$('#btnSaveChanges').hide();

window.addEventListener("beforeunload", beforeunload);

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        const {data, error} = await supabase
          .from('chapters')
          .select('title,body,is_published')
          .eq('id', chapterid)
          .single();
        if (error) {
            erroralert(error.message);
        } else {
            $('#chapTitle').val(data.title);

            editor = new EditorJS({
                holder:'editorjs',
                placeholder: 'Write your next masterpiece!',
                tools: {
                    header: {
                        class: Header,
                        shortcut: 'CMD+SHIFT+H',
                        inlineToolbar: ['link'],
                        levels: [2, 3, 4],
                        defaultLevel: 3
                    }
                },
                data: data.body
            });
        }

        if (data.is_published) {

            $('#btnSaveChanges').show();
            $('#btnSaveChanges').click(saveChanges);

        } else {
            $('#btnSaveDraft').show();
            $('#btnPublish').show();

            $('#btnSaveDraft').on('click', save.bind(this, false));
            $('#btnPublish').on('click', save.bind(this, true));
        }
}});
    
    
async function save(is_published) {

    let chaptitle = $('#chapTitle').val();

    if (!chaptitle) {
        erroralert('Chapter title is required');
    } else {
        editor.save().then((outputData) => {

            if (outputData.blocks.length == 0) {
                erroralert('Chapter is empty');
            } else {

                supabase.from('chapters')
                .update({ title: chaptitle, body: outputData, is_published: is_published })
                .match({ id: chapterid }).then(async ({data, error})=> {

                    if (error) {
                      erroralert(error.message);
                    } else {

                        if(is_published) {

                            const {data:timestamp, error:timestampError} = await supabase
                                .rpc('get_server_timestampz');
                          
                            if (timestampError) {
                                erroralert(timestampError.message);
                            } else {
                                const {data:seriesUpdate, error:seriesUpdateError} = await supabase
                                    .from('series')
                                    .update({ updatedat: timestamp })
                                    .match({ id: seriesid });

                                if (seriesUpdateError) {
                                    erroralert(seriesUpdateError.message);
                                }
                            }

                        }

                        saved = true;

                        let text = is_published ? 'Chapter published successfully' : 'Chapter saved as draft';

                        successalert(text,function() {
                            window.location = `/dashboard/series/${seriesid}`;
                        });
                    }

                });
            
            }

        });   
    }
}

async function saveChanges() {

    let chaptitle = $('#chapTitle').val();

    if (!chaptitle) {
        erroralert('Chapter title is required');
    } else {
        editor.save().then((outputData) => {

            if (outputData.blocks.length == 0) {
                erroralert('Chapter is empty');
            } else {

                supabase.from('chapters')
                .update({ title: chaptitle, body: outputData })
                .match({ id: chapterid }).then(({data, error})=> {

                    if (error) {
                      erroralert(error.message);
                    } else {

                        saved = true;

                        successalert('Changes saved successfully',function() {
                            window.location = `/dashboard/series/${seriesid}`;
                        });
                    }

                });
            
            }

        });   
    }

}

function beforeunload (e) {

    if (!saved) {

        var confirmationMessage = 'It looks like you have been editing something. '
                            + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;

    }
}