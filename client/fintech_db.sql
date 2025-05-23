PGDMP                      }         
   fintech_db    17.3    17.3 D    t           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            u           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            v           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            w           1262    16388 
   fintech_db    DATABASE     p   CREATE DATABASE fintech_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-US';
    DROP DATABASE fintech_db;
                     postgres    false            �            1259    16607    alerts    TABLE     �   CREATE TABLE public.alerts (
    alert_id integer NOT NULL,
    user_id integer NOT NULL,
    budget_id integer NOT NULL,
    message text NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.alerts;
       public         heap r       postgres    false            �            1259    16606    alerts_alert_id_seq    SEQUENCE     �   CREATE SEQUENCE public.alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.alerts_alert_id_seq;
       public               postgres    false    228            x           0    0    alerts_alert_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.alerts_alert_id_seq OWNED BY public.alerts.alert_id;
          public               postgres    false    227            �            1259    16589    budgets    TABLE     �   CREATE TABLE public.budgets (
    budget_id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date NOT NULL
);
    DROP TABLE public.budgets;
       public         heap r       postgres    false            �            1259    16588    budgets_budget_id_seq    SEQUENCE     �   CREATE SEQUENCE public.budgets_budget_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.budgets_budget_id_seq;
       public               postgres    false    226            y           0    0    budgets_budget_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.budgets_budget_id_seq OWNED BY public.budgets.budget_id;
          public               postgres    false    225            �            1259    16547 
   categories    TABLE     n   CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(50) NOT NULL
);
    DROP TABLE public.categories;
       public         heap r       postgres    false            �            1259    16546    categories_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.categories_category_id_seq;
       public               postgres    false    220            z           0    0    categories_category_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;
          public               postgres    false    219            �            1259    16569    expenses    TABLE     �   CREATE TABLE public.expenses (
    expense_id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    date date DEFAULT CURRENT_DATE NOT NULL
);
    DROP TABLE public.expenses;
       public         heap r       postgres    false            �            1259    16568    expenses_expense_id_seq    SEQUENCE     �   CREATE SEQUENCE public.expenses_expense_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.expenses_expense_id_seq;
       public               postgres    false    224            {           0    0    expenses_expense_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.expenses_expense_id_seq OWNED BY public.expenses.expense_id;
          public               postgres    false    223            �            1259    16556    income    TABLE     �   CREATE TABLE public.income (
    income_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    source character varying(100),
    date date DEFAULT CURRENT_DATE NOT NULL
);
    DROP TABLE public.income;
       public         heap r       postgres    false            �            1259    16555    income_income_id_seq    SEQUENCE     �   CREATE SEQUENCE public.income_income_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.income_income_id_seq;
       public               postgres    false    222            |           0    0    income_income_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.income_income_id_seq OWNED BY public.income.income_id;
          public               postgres    false    221            �            1259    16662    session    TABLE     �   CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
    DROP TABLE public.session;
       public         heap r       postgres    false            �            1259    16649    transactions    TABLE       CREATE TABLE public.transactions (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    amount numeric NOT NULL,
    category character varying(100) NOT NULL,
    description text NOT NULL,
    date date NOT NULL,
    user_id integer NOT NULL
);
     DROP TABLE public.transactions;
       public         heap r       postgres    false            �            1259    16648    transactions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.transactions_id_seq;
       public               postgres    false    230            }           0    0    transactions_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;
          public               postgres    false    229            �            1259    16534    users    TABLE     �   CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16533    users_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.users_user_id_seq;
       public               postgres    false    218            ~           0    0    users_user_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;
          public               postgres    false    217            �           2604    16610    alerts alert_id    DEFAULT     r   ALTER TABLE ONLY public.alerts ALTER COLUMN alert_id SET DEFAULT nextval('public.alerts_alert_id_seq'::regclass);
 >   ALTER TABLE public.alerts ALTER COLUMN alert_id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    16592    budgets budget_id    DEFAULT     v   ALTER TABLE ONLY public.budgets ALTER COLUMN budget_id SET DEFAULT nextval('public.budgets_budget_id_seq'::regclass);
 @   ALTER TABLE public.budgets ALTER COLUMN budget_id DROP DEFAULT;
       public               postgres    false    226    225    226            �           2604    16550    categories category_id    DEFAULT     �   ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);
 E   ALTER TABLE public.categories ALTER COLUMN category_id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    16572    expenses expense_id    DEFAULT     z   ALTER TABLE ONLY public.expenses ALTER COLUMN expense_id SET DEFAULT nextval('public.expenses_expense_id_seq'::regclass);
 B   ALTER TABLE public.expenses ALTER COLUMN expense_id DROP DEFAULT;
       public               postgres    false    224    223    224            �           2604    16559    income income_id    DEFAULT     t   ALTER TABLE ONLY public.income ALTER COLUMN income_id SET DEFAULT nextval('public.income_income_id_seq'::regclass);
 ?   ALTER TABLE public.income ALTER COLUMN income_id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    16652    transactions id    DEFAULT     r   ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);
 >   ALTER TABLE public.transactions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    229    230            �           2604    16537    users user_id    DEFAULT     n   ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);
 <   ALTER TABLE public.users ALTER COLUMN user_id DROP DEFAULT;
       public               postgres    false    218    217    218            n          0    16607    alerts 
   TABLE DATA           M   COPY public.alerts (alert_id, user_id, budget_id, message, date) FROM stdin;
    public               postgres    false    228   �P       l          0    16589    budgets 
   TABLE DATA           `   COPY public.budgets (budget_id, user_id, category_id, amount, start_date, end_date) FROM stdin;
    public               postgres    false    226   �P       f          0    16547 
   categories 
   TABLE DATA           7   COPY public.categories (category_id, name) FROM stdin;
    public               postgres    false    220   �P       j          0    16569    expenses 
   TABLE DATA           _   COPY public.expenses (expense_id, user_id, category_id, amount, description, date) FROM stdin;
    public               postgres    false    224   �P       h          0    16556    income 
   TABLE DATA           J   COPY public.income (income_id, user_id, amount, source, date) FROM stdin;
    public               postgres    false    222   Q       q          0    16662    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public               postgres    false    231    Q       p          0    16649    transactions 
   TABLE DATA           ^   COPY public.transactions (id, type, amount, category, description, date, user_id) FROM stdin;
    public               postgres    false    230   R       d          0    16534    users 
   TABLE DATA           C   COPY public.users (user_id, username, email, password) FROM stdin;
    public               postgres    false    218   �R                  0    0    alerts_alert_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.alerts_alert_id_seq', 1, false);
          public               postgres    false    227            �           0    0    budgets_budget_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.budgets_budget_id_seq', 1, false);
          public               postgres    false    225            �           0    0    categories_category_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.categories_category_id_seq', 1, false);
          public               postgres    false    219            �           0    0    expenses_expense_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.expenses_expense_id_seq', 1, false);
          public               postgres    false    223            �           0    0    income_income_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.income_income_id_seq', 1, false);
          public               postgres    false    221            �           0    0    transactions_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.transactions_id_seq', 45, true);
          public               postgres    false    229            �           0    0    users_user_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.users_user_id_seq', 17, true);
          public               postgres    false    217            �           2606    16615    alerts alerts_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (alert_id);
 <   ALTER TABLE ONLY public.alerts DROP CONSTRAINT alerts_pkey;
       public                 postgres    false    228            �           2606    16595    budgets budgets_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (budget_id);
 >   ALTER TABLE ONLY public.budgets DROP CONSTRAINT budgets_pkey;
       public                 postgres    false    226            �           2606    16554    categories categories_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
       public                 postgres    false    220            �           2606    16552    categories categories_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public                 postgres    false    220            �           2606    16577    expenses expenses_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (expense_id);
 @   ALTER TABLE ONLY public.expenses DROP CONSTRAINT expenses_pkey;
       public                 postgres    false    224            �           2606    16562    income income_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_pkey PRIMARY KEY (income_id);
 <   ALTER TABLE ONLY public.income DROP CONSTRAINT income_pkey;
       public                 postgres    false    222            �           2606    16668    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public                 postgres    false    231            �           2606    16656    transactions transactions_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_pkey;
       public                 postgres    false    230            �           2606    16545    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    16541    users users_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           2606    16543    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    218            �           1259    16669    IDX_session_expire    INDEX     J   CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
 (   DROP INDEX public."IDX_session_expire";
       public                 postgres    false    231            �           2606    16621    alerts alerts_budget_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(budget_id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.alerts DROP CONSTRAINT alerts_budget_id_fkey;
       public               postgres    false    4802    228    226            �           2606    16616    alerts alerts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.alerts DROP CONSTRAINT alerts_user_id_fkey;
       public               postgres    false    218    4790    228            �           2606    16601     budgets budgets_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.budgets DROP CONSTRAINT budgets_category_id_fkey;
       public               postgres    false    4796    226    220            �           2606    16596    budgets budgets_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.budgets DROP CONSTRAINT budgets_user_id_fkey;
       public               postgres    false    226    218    4790            �           2606    16583 "   expenses expenses_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.expenses DROP CONSTRAINT expenses_category_id_fkey;
       public               postgres    false    220    4796    224            �           2606    16578    expenses expenses_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.expenses DROP CONSTRAINT expenses_user_id_fkey;
       public               postgres    false    218    4790    224            �           2606    16657    transactions fk_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 >   ALTER TABLE ONLY public.transactions DROP CONSTRAINT fk_user;
       public               postgres    false    218    4790    230            �           2606    16563    income income_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.income DROP CONSTRAINT income_user_id_fkey;
       public               postgres    false    218    4790    222            n      x������ � �      l      x������ � �      f      x������ � �      j      x������ � �      h      x������ � �      q   �   x���Ak�@���_�Y���uoiK�%�)5M	��U�[5�Ӑ�����<���c��J�]��Ƿ����m�����4�;Lΰ��A��6e^V���a�[G��� Mi���K���S�E#O�l��}f�E��k�*}ՙ��M�0��}�&-?�.�?��R1"YD��jXm�{���?���-�I��@��s����py�P_	�X�@^�{DN��N!ɻG��
l<      p   �   x�����@E�ٯ��J�O��B)mVX�w���Q^��9s�̕�.���L�/��Bs�tD�1�'�	�g�/8pA����h]Z�C�"����hq�H��*n�s��4�|o�	���Q��r�|��v�.�[L��_�4�'YK�o������h�X��B{|��]��c��v�D���[�^s�2$J�������z@�㷃      d   �  x�m�˖�@�5<�k�Dp7*���N6�����(���cf�1����|UP�%i����(k9�_��ZJ[&,d��`!���?�/�w�]�^��J�q.ur�9�Du;��͗)�x�*��,BE�{�H-̤�#Py��u�)L�]�*��pPSƍ�����Co]���j��À's-_N��^
W�{���5����� ��ɫ�$�U�M�}ć#�Kܰ�)�`�m�i�)���6݂�Pz��2���gܚu�w�2���V�,k���Z������(�b���-�X�p�0��h_\���Kb�^��MT��+;�=@[MK�������L�}T� U�5!E�~Ci����[�$+wj���d�}�ԕqO�BPKo�Hmn�wշ�V��$Q� ���     