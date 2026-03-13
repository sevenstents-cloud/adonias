-- Este foi o script rodado pelo usuário no Supabase. O banco já possui essa estrutura de tabelas.

-- 1. Criar Tipos Customizados (Enums)
CREATE TYPE user_role AS ENUM ('ADMIN', 'FINANCEIRO', 'OPERACIONAL');
CREATE TYPE cost_center_type AS ENUM ('GERAL', 'OBRA');
CREATE TYPE transaction_type AS ENUM ('RECEITA', 'DESPESA');
CREATE TYPE transaction_status AS ENUM ('PENDENTE', 'PAGO', 'RECEBIDO', 'CANCELADO');

-- 2. Tabela de Perfis de Usuário
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'OPERACIONAL' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Centros de Custo
CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type cost_center_type NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir o Centro de Custo Geral Padrão
INSERT INTO public.cost_centers (name, type, description) 
VALUES ('Administrativo / Geral', 'GERAL', 'Centro de custos para despesas e receitas gerais da empresa');

-- 4. Tabela de Obras / Projetos
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE RESTRICT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  contract_value NUMERIC(12,2) DEFAULT 0.00,
  start_date DATE,
  expected_end_date DATE,
  status TEXT DEFAULT 'EM_ANDAMENTO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  description TEXT
);

-- Inserir categorias base para Esquadrias
INSERT INTO public.categories (name, type) VALUES 
('Venda de Esquadrias', 'RECEITA'),
('Material - Perfil de Alumínio', 'DESPESA'),
('Material - Vidros', 'DESPESA'),
('Material - Ferragens e Acessórios', 'DESPESA'),
('Mão de Obra - Terceirizada', 'DESPESA'),
('Despesas Fixas (Água, Luz, Net)', 'DESPESA'),
('Folha de Pagamento', 'DESPESA');

-- 6. Tabela de Transações (Lançamentos)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE RESTRICT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'PENDENTE' NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Configuração de Segurança (RLS - Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Exemplo de Política: Apenas ADMIN e FINANCEIRO podem deletar transações
CREATE POLICY "Permitir delete para Admin/Financeiro" ON public.transactions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('ADMIN', 'FINANCEIRO')
  )
);

-- Políticas de Leitura (Todos logados podem ler, dependendo da regra de negócio)
CREATE POLICY "Leitura autenticada" ON public.transactions FOR SELECT USING (auth.role() = 'authenticated');
-- (Adicione políticas semelhantes de SELECT, INSERT e UPDATE para as outras tabelas conforme a necessidade).
