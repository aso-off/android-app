<!-- app/components/Home.vue -->
<template>
    <Page actionBarHidden="true">
      <!-- Свой header без отступа -->
      <GridLayout rows="auto" class="header">
        <Label text="MiniHabit" class="header-title" verticalAlignment="center" horizontalAlignment="center" />
      </GridLayout>
  
      <TabView :selectedIndex.sync="selectedIndex" androidTabsPosition="bottom" iosIconRenderingMode="automatic">
        <TabViewItem title="Планы">
          <Frame>
            <Plans ref="plansTab" />
          </Frame>
        </TabViewItem>
        <TabViewItem title="Сегодня">
          <Frame>
            <Today ref="todayTab" />
          </Frame>
        </TabViewItem>
        <TabViewItem title="Добавить">
          <Frame>
            <AddPlan :onSave="onAddPlanGlobal" />
          </Frame>
        </TabViewItem>
      </TabView>
    </Page>
  </template>
  
  <script>
  import Plans from './Plans.vue';
  import Today from './Today.vue';
  import AddPlan from './AddPlan.vue';
  import * as settings from '@nativescript/core/application-settings';
  import notificationService from '../utils/notificationService';
  
  export default {
    components: { Plans, Today, AddPlan },
    data() {
      return {
        selectedIndex: 0,
      };
    },
    methods: {
      onAddPlanGlobal(newPlan) {
        let plans = [];
        const saved = settings.getString('plans', '[]');
        try { plans = JSON.parse(saved); } catch { plans = []; }
        const id = Date.now();
        plans.push({
          id,
          title: newPlan.title,
          date: newPlan.date,
          time: newPlan.time,
          recurring: newPlan.recurring,
          lastDone: null,
        });
        settings.setString('plans', JSON.stringify(plans));
        notificationService.initAndScheduleAll(plans);
        // Обновляем Plans.vue
        if (this.$refs.plansTab && typeof this.$refs.plansTab.loadPlans === 'function') {
          this.$refs.plansTab.loadPlans();
        }
        // Обновляем Today.vue сразу
        if (this.$refs.todayTab) {
          if (typeof this.$refs.todayTab.loadPlans === 'function') {
            this.$refs.todayTab.loadPlans();
          }
          if (typeof this.$refs.todayTab.filterToday === 'function') {
            this.$refs.todayTab.filterToday();
          }
        }
        // Переключаем на вкладку "Планы"
        this.selectedIndex = 0;
      },
    },
  };
  </script>
  
  <style scoped>
  .header {
    background-color: #1f1f1f;
    height: 56; /* dip */
  }
  .header-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
  }
  </style>
  