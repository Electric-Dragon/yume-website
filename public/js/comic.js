import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 2];
let seriesid = arr[arr.length - 3];

console.log(chapterid);

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
        if (!user) {
          window.location = "/signin";
        }
  
        const { data, error } = await supabase
        .from('chapters')
        .select('title,seriesid(title)')
        .eq('id', chapterid)
        .single()
  
        if (error) {
          erroralert(error.message);
        } else {
            
            let {title, seriesid} = data;

            $('#seriesTitle').text(seriesid.title);
            $('#title').val(title);
  
        }
  
  }});