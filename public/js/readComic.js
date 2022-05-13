import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';
const fpPromise = import('https://openfpcdn.io/fingerprintjs/v3').then(FingerprintJS => FingerprintJS.load())

let supabase, likeid, user;
let liked = false;
let likes = 0;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 1];
let seriesid = arr[arr.length - 2];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

$('#commentSection').hide()

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        user = await supabase.auth.user();

        const {data, error} = await supabase
          .from('chapters')
          .select('title,images,createdat,chapternum,series(id,genre1,genre2,creator,title),totalreads')
          .eq('id', chapterid)
          .single();
        if (error) {
            erroralert(error.message);
        } else {

            let {title, images, createdat, chapternum, series, totalreads} = data;

            let seriesid = series;

            const { data:chapterLikes, error___ } = await supabase
            .rpc('getChapterLikes', { chapterid: chapterid });

            likes = chapterLikes;

            $('#chapTitle').text(title);
            $('#title').text(title);
            $('#likeCount').text(`${likes} Likes`)
            $('#chapNum').text(chapternum);
            $('#chapReads').text(`${totalreads} `);

            let date = new Date(createdat);
            $('#chapDate').text(`${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);

            $('#genre1').attr('href',`/genre/${seriesid.genre1}`);
            $('#genre1').text(seriesid.genre1);

            $('#genre2').attr('href',`/genre/${seriesid.genre2}`);
            $('#genre2').text(seriesid.genre2);

            $('#seriesTitle').text(seriesid.title);
            $('#seriesTitle').attr('href',`/series/${seriesid.id}`);

            images.forEach(panelLink => {
                let element = `<img src="${panelLink}" class="w-comic mx-auto">`
                $('#panelContainer').append(element);
            });

            let saveInfo = {
                title: seriesid.title,
                chapternum: chapternum,
                seriesid: seriesid.id,
                chapterid: chapterid,
                path:'comic'
            }

            localStorage.setItem('saveInfo', JSON.stringify(saveInfo));

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
                $('#prevChap').attr('href',`/read/comic/${seriesid.id}/${prevChap.id}`);
                $('#prev').attr('href',`/read/comic/${seriesid.id}/${prevChap.id}`);
                $('#prevChap').text(`< ${prevChap.title}`);
            } else {
                $('#prevChap').hide();
                $('#prev').hide();
                $('#prevChapHeading').hide();
            }

            if (nextChap) {
                $('#nextChap').attr('href',`/read/comic/${seriesid.id}/${nextChap.id}`);
                $('#next').attr('href',`/read/comic/${seriesid.id}/${nextChap.id}`);
                $('#nextChap').text(`${nextChap.title} >`);
            } else {
                $('#nextChap').hide();
                $('#next').hide();
                $('#nextChapHeading').hide();
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
            $('#viewProfile').attr('href',`/user/${username}`)

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

            if (user) {
                $.ajax({
                    type:"POST",
                    url:'/readChapter',
                    data:{id: seriesid.id,
                    access_token: supabase.auth.session().access_token},        
                });
            }

            fpPromise
            .then(fp => fp.get())
            .then(result => {
                const visitorId = result.visitorId
                $.ajax({
                    type:"POST",
                    url:'/addRead',
                    data:{id: chapterid,
                    fingerprint: visitorId},        
                });
            })
        }
}});

window.toggleLike = async function toggleLike() {

    if (!user) {
        erroralert('You must be logged in to like a chapter');
    } else {

        if (liked) {

            likes-=1;

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

            likes+=1;

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

    $('#likeCount').text(`${likes} Likes`);

    if (liked) {
        $("#checkbox").prop("checked", true)

    } else {
        $("#checkbox").prop("checked", false)
    }
}