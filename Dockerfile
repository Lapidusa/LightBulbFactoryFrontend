FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_PRODUCT_API
ARG VITE_ORDER_API
ARG VITE_ADMIN_API
ENV VITE_PRODUCT_API=$VITE_PRODUCT_API
ENV VITE_ORDER_API=$VITE_ORDER_API
ENV VITE_ADMIN_API=$VITE_ADMIN_API

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
