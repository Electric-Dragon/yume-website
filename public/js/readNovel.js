import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';
let supabase, editor, likeid, user;
let liked = false;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 1];
let seriesid = arr[arr.length - 2];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let heartsvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
    </svg>`
let lovedsvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
</svg>`


$('#commentSection').hide()

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        user = await supabase.auth.user();

        const {data, error} = await supabase
          .from('chapters')
          .select('title,body,createdat,chapternum,seriesid(id,genre1,genre2,creator),likes')
          .eq('id', chapterid)
          .single();
        if (error) {
            erroralert(error.message);
        } else {

            let {title, body, createdat, chapternum, seriesid, likes} = data;

            $('#chapTitle').text(title);
            $('#title').text(title);
            $('#likeCount').text(`${likes} Likes`)
            $('#chapNum').text(chapternum);

            let date = new Date(createdat);
            $('#chapDate').text(`${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);

            $('#genre1').attr('href',`/genres/${seriesid.genre1}`);
            $('#genre1').text(seriesid.genre1);

            $('#genre2').attr('href',`/genres/${seriesid.genre2}`);
            $('#genre2').text(seriesid.genre2);

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
                readOnly: true,
                data: body,
                minHeight : 0
            });

            const {data:prevChap, error} = await supabase
                .from('chapters')
                .select('id,title')
                .match({seriesid:seriesid.id,chapternum:chapternum-1,is_published:true})
                .maybeSingle()

            const {data:nextChap, _} = await supabase
                .from('chapters')
                .select('id,title')
                .match({seriesid:seriesid.id,chapternum:chapternum+1,is_published:true})
                .maybeSingle()

            if (prevChap) {
                $('#prevChap').attr('href',`/read/novel/${seriesid.id}/${prevChap.id}`);
                $('#prev').attr('href',`/read/novel/${seriesid.id}/${prevChap.id}`);
                $('#prevChap').text(`< ${prevChap.title}`);
            }

            if (nextChap) {
                $('#nextChap').attr('href',`/read/novel/${seriesid.id}/${nextChap.id}`);
                $('#next').attr('href',`/read/novel/${seriesid.id}/${nextChap.id}`);
                $('#nextChap').text(`${nextChap.title} >`);
            }

            const {data:creatorDetails, error__} = await supabase
                .from('public_profile')
                .select()
                .eq('id', seriesid.creator)
                .single()

            let {pfp, username, description} = creatorDetails;
            $('#creatorPfp').attr('src',pfp);
            $('#creatorUsername').text(username);
            $('#creatorDescription').text(description);

            const {data:likedChap, error:error_} = await supabase
                .from('chapter_likes')
                .select('id')
                .match({user:user.id,chapter:chapterid})
            
            if (likedChap.length === 0) {
                liked = false
            } else {
                likeid = likedChap[0].id;
                liked = true;
            }
            toggleLikeButton(); 
        }
}});

window.toggleLike = async function toggleLike() {

    if (!user) {
        erroralert('You must be logged in to like a chapter');
    } else {

        if (liked) {

            console.log(likeid);

            const { data, error } = await supabase
                .from('chapter_likes')
                .delete()
                .match({ id: likeid })
    
            if (error) {
                erroralert(error.message);
            } else {
                liked = false;
                toggleLikeButton();
            }
        } else {
            const { data, error } = await supabase
                .from('chapter_likes')
                .insert([
                    { user: user.id, chapter: chapterid }
                ])
            if (error) {
                erroralert(error.message);
            } else {
                likeid = data[0].id;
                liked = true;
                toggleLikeButton();
            }
        }

    }

}

window.addComment = async function addComment() {
    if (!user) {
        erroralert('You must be logged in to comment');
    } else {

        let commentBody = $('#commentBody').val();
        if (!commentBody) {
            erroralert('Comment cannot be empty');
        } else {

            const { data, error } = await supabase
                .from('comments')
                .insert([
                    { user: user.id, chapter: chapterid, content: commentBody }
                ])
    
            if (error) {
                erroralert(error.message);
            } else {
                successalert('Comment added');
                $('#commentBody').val('');
                $('#commentBody').attr('placeholder', 'Type Your Comment');
                getComments();
            }

        }

    }
}

window.toggleCommentSection = function toggleCommentSection() {
    $('#commentSection').toggle();
}

let toggleLikeButton = function() {
    if (liked) {
        $('#likeButtonText').text('Unlike');
        $('#likeButtonText').append(lovedsvg);

    } else {
        $('#likeButtonText').text('Like');
        $('#likeButtonText').append(heartsvg);
    }
}