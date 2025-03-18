# Estágio de build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiar todo o código fonte
COPY . .
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar os arquivos de build para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar arquivos públicos
COPY public /usr/share/nginx/html/public
COPY promo-banner.jpg /usr/share/nginx/html/
COPY logo.png /usr/share/nginx/html/

# Configuração do Nginx para o React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 