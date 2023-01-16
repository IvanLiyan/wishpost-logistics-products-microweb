# build environment
FROM  harbor.infra.wish-cn.com/wish/base-image/node-wnpm:latest as build
WORKDIR /tmp
# ENV PATH /app/node_modules/.bin:$PATH
COPY . ./
RUN npm install
RUN npm run prod

FROM harbor.infra.wish-cn.com/upstream/nginx:1.22-alpine
COPY --from=build /tmp/dist /home/nginx/static/dist
# new
COPY ./docker/static.conf /etc/nginx/conf.d/static.conf