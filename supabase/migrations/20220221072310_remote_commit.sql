CREATE TABLE IF NOT EXISTS public.users
(
    id character varying COLLATE pg_catalog."default" NOT NULL,
    premium boolean NOT NULL,
    credits integer NOT NULL,
    username character varying COLLATE pg_catalog."default" NOT NULL,
    revenue double precision NOT NULL,
    creator boolean NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to supabase_admin;

ALTER TABLE IF EXISTS public.users
    ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.users TO anon;

GRANT ALL ON TABLE public.users TO authenticated;

GRANT ALL ON TABLE public.users TO postgres;

GRANT ALL ON TABLE public.users TO service_role;

GRANT ALL ON TABLE public.users TO supabase_admin;

COMMENT ON TABLE public.users
    IS 'Contains User Information';
