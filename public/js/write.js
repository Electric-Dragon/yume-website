import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
let supabase, editor;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 2];
let seriesid = arr[arr.length - 3];

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        const {data, error} = await supabase.from('chapters')
                                            .select('title,body,is_published')
                                            .eq('id', chapterid)
                                            .single();
        if (error) {

            let Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              })
                      
              Toast.fire({
                icon: 'error',
                title: error.message
              });

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

        $('#btnSaveDraft').on('click', save.bind(this, false));
        $('#btnPublish').on('click', save.bind(this, true));
}});
    
    
async function save(is_published) {

    let chaptitle = $('#chapTitle').val();

    if (!chaptitle) {
        let Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
                  
          Toast.fire({
            icon: 'error',
            title: 'Enter a chapter title!'
          });
    } else {
        editor.save().then((outputData) => {
            console.log('Article data: ', outputData);     

            if (outputData.blocks.length == 0) {
                let Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  })
                          
                  Toast.fire({
                    icon: 'error',
                    title: 'Enter a novel body!'
                  });
            } else {

                supabase.from('chapters')
                .update({ title: chaptitle, body: outputData, is_published: is_published })
                .match({ id: chapterid }).then(({data, error})=> {

                    if (error) {

                        let Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                          })
                                  
                          Toast.fire({
                            icon: 'error',
                            title: error.message
                          });
    
                    } else {
                        let Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                          })

                          let text = is_published ? 'Chapter published successfully' : 'Chapter saved as draft';
                                  
                          Toast.fire({
                            icon: 'success',
                            title: text
                          }).then(function() {
                            window.location = `/dashboard/series/${seriesid}`;
                          })
                    }

                });
            
            }

        });   
    }
}