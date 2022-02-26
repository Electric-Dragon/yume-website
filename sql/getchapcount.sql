CREATE OR REPLACE FUNCTION "totalchapcount" (storyid uuid)
RETURNS integer AS $total$
declare
	total integer;
BEGIN
   SELECT count(*) into total FROM chapters
   WHERE seriesid=storyid;
   RETURN total;
END;
$total$ LANGUAGE plpgsql;