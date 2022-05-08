import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user;

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        user = supabase.auth.user();

        if (!user) {
            window.location = '/signin';
            return;
        }

}});

window.postComment = async function postComment (e) {
    e.preventDefault();

    let comment = $("#comment").val();

    if (comment.length < 1) {
        erroralert("Please enter a comment");
        return;
    }

    $("#btnPostComment").html("Posting...");
    $('#btnPostComment').attr('disabled', true);

    const { data, error } = await supabase
    .from('feed')
    .insert([
        { creator: user.id, message: comment }
    ]);

    if (error) {
        erroralert(error.message);
        $("#btnPostComment").html("Post Comment");
        $('#btnPostComment').attr('disabled', false);
    } else {
        successalert("Comment posted successfully!");
        $("#btnPostComment").html("Post Comment");
        $('#btnPostComment').attr('disabled', false);
        $("#comment").val("");
    }

}