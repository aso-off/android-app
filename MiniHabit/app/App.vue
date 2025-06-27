<!-- app/App.vue -->
<template>
      <Home />

  </template>
  
  <script>
  import Home from './components/Home.vue';
  import * as settings from '@nativescript/core/application-settings';
  import notificationService from './utils/notificationService';
  
  export default {
    components: { Home },
    created() {
      // При старте инициализируем уведомления
      let plans = [];
      const saved = settings.getString('plans', '[]');
      try {
        plans = JSON.parse(saved);
      } catch {
        plans = [];
      }
      notificationService.initAndScheduleAll(plans);
    },
  };
  </script>
  