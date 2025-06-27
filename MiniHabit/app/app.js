// app/main.js
import Vue from 'nativescript-vue';
import App from './App.vue';
import './app.scss'; // если шаблон не подключает автоматически

Vue.config.silent = false;

new Vue({
  render: (h) => h(App),
}).$start();
