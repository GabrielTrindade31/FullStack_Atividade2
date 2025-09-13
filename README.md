# Calculadora de Idade (React + TypeScript + Tailwind + react-hook-form)

## Como testar rapidamente (sem instalar nada)
Abra o arquivo **index.html** no navegador. Ele usa CDNs para React, Tailwind e react-hook-form.

## Como rodar e editar o projeto (com Vite)
1. `npm install`
2. `npm run dev`
3. Abrir `http://localhost:5173`
4. O Tailwind está configurado em `tailwind.config.js` e `src/styles.css`.

## Hooks utilizados
- `useState`, `useEffect`, `useMemo` (além do `useForm` do react-hook-form).

## Componentes customizados
- `InputField` e `ResultRow`.

## Validações
- Campos de data com validações de formato, limites e consistência (dias válidos por mês e ano bissexto).


## Deploy na Vercel
- Basta importar este repositório na Vercel.
- A Vercel detecta Vite automaticamente com base no `package.json`.
- Build: `vite build` (já padrão). Output: `dist`.
- Após o deploy, a app roda a partir de `dist`.
- Se quiser a versão sem build, abra `public/standalone.html` (não é para deploy).

## Dica para Codespaces/GitHub Live Server
- O arquivo `public/standalone.html` funciona 100% sem bundler.
- O `index.html` padrão agora é o da app Vite (precisa rodar `npm run dev` ou `vite build`).
