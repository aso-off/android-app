<!-- app/components/Plans.vue -->
<template>
    <Page actionBarHidden="true" @navigatedTo="onNavigatedTo">
      <!-- Собственный header -->
      <GridLayout rows="auto" class="header">
        <Label text="Планы" class="header-title" verticalAlignment="center" horizontalAlignment="center" />
      </GridLayout>
  
      <!-- Контент: ListView или placeholder -->
      <StackLayout>
        <StackLayout v-if="sortedPlans.length === 0" class="empty-container">
          <Label
            text="Нет планов. Перейдите на вкладку «Добавить», чтобы создать план."
            class="text-center text-muted"
          />
        </StackLayout>
        <ListView v-else for="(plan, index) in sortedPlans" @itemTap="noop">
          <v-template>
            <GridLayout class="plan-item" columns="auto, *, auto">
              <!-- Отступ слева, если нужно: здесь можно убрать padding -->
              <StackLayout col="1">
                <Label :text="plan.title" class="plan-title" textWrap="true" />
                <Label :text="displaySchedule(plan)" class="plan-time" />
                <Label :text="displayNextOccur(plan)" class="plan-next" />
              </StackLayout>
              <Button text="✕" class="delete-btn" @tap="deletePlan(plan.id)" col="2" />
            </GridLayout>
          </v-template>
        </ListView>
      </StackLayout>
    </Page>
  </template>
  
  <script>
  import * as settings from '@nativescript/core/application-settings';
  import notificationService from '../utils/notificationService';
  
  export default {
    data() {
      return {
        plans: [],
      };
    },
    computed: {
      sortedPlans() {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const arr = this.plans.slice();
        const withNext = arr.map(plan => {
          let nextDate = null;
          const [hh, mm] = plan.time.split(':').map(n => parseInt(n, 10));
          if (plan.recurring) {
            if (plan.lastDone === todayStr) {
              nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm);
            } else {
              let dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
              if (dt <= now) {
                dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm);
              }
              nextDate = dt;
            }
          } else if (plan.date) {
            const [y, mo, d] = plan.date.split('-').map(n => parseInt(n, 10));
            const dt = new Date(y, mo - 1, d, hh, mm);
            nextDate = dt > now ? dt : dt;
          }
          return { plan, nextDate };
        });
        withNext.sort((a, b) => {
          const da = a.nextDate, db = b.nextDate;
          if (da && db) return da - db;
          if (da && !db) return -1;
          if (!da && db) return 1;
          const toDate = p => {
            if (!p.date) return Infinity;
            const [y, mo, d] = p.date.split('-').map((n,i)=> i===0?parseInt(n):i===1?parseInt(n)-1:parseInt(n));
            const [hh, mm] = p.time.split(':').map(n=>parseInt(n));
            return new Date(y, mo, d, hh, mm);
          };
          return toDate(a.plan) - toDate(b.plan);
        });
        return withNext.map(item => item.plan);
      },
    },
    methods: {
      noop() {},
      onNavigatedTo() {
        this.loadPlans();
      },
      loadPlans() {
        const saved = settings.getString('plans', '[]');
        try {
          this.plans = JSON.parse(saved);
        } catch {
          this.plans = [];
        }
        notificationService.initAndScheduleAll(this.plans);
      },
      savePlans() {
        settings.setString('plans', JSON.stringify(this.plans));
        notificationService.initAndScheduleAll(this.plans);
      },
      deletePlan(planId) {
        const idx = this.plans.findIndex(p => p.id === planId);
        if (idx !== -1) {
          this.plans.splice(idx, 1);
          this.savePlans();
        }
      },
      displaySchedule(plan) {
        if (plan.recurring) {
          return `Каждый день в ${plan.time}`;
        } else if (plan.date) {
          return `${plan.date} в ${plan.time}`;
        }
        return `В ${plan.time}`;
      },
      displayNextOccur(plan) {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const [hh, mm] = plan.time.split(':').map(n => parseInt(n, 10));
        let dt = null;
        if (plan.recurring) {
          if (plan.lastDone === todayStr) {
            dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm);
          } else {
            let cand = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
            if (cand <= now) {
              cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm);
            }
            dt = cand;
          }
        } else if (plan.date) {
          const [y, mo, d] = plan.date.split('-').map(n => parseInt(n, 10));
          dt = new Date(y, mo - 1, d, hh, mm);
        }
        if (!dt) return '';
        const dateStr = dt.toISOString().slice(0, 10);
        if (dateStr === todayStr) {
          return `Сегодня в ${plan.time}`;
        }
        const day = dt.getDate().toString().padStart(2, '0');
        const mon = (dt.getMonth() + 1).toString().padStart(2, '0');
        const year = dt.getFullYear();
        return `${day}.${mon}.${year} в ${plan.time}`;
      },
    },
    created() {
      this.loadPlans();
    },
  };
  </script>
  
  <style scoped>
  .header {
    background-color: #1f1f1f;
    height: 56;
  }
  .header-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
  }
  /* Карточка: отступ между элементами 10 dip */
  .plan-item {
    background-color: #1e1e1e;
    border-radius: 12;
    padding: 16;
    margin: 5 16; /* сверху/снизу 5 dip => между двумя элементами будет 10 */
  }
  /* Заголовок плана */
  .plan-title {
    font-size: 18;
    font-weight: bold;
    color: #ffffff;
  }
  /* Время */
  .plan-time {
    font-size: 14;
    color: #bbbbbb;
    margin-top: 4;
  }
  /* Ближайшее выполнение */
  .plan-next {
    font-size: 12;
    color: #888888;
    margin-top: 2;
  }
  /* Кнопка удаления 40x40 */
  .delete-btn {
    width: 40;
    height: 40;
    font-size: 14;
    border-radius: 20;
    background-color: #ef4444;
    color: #ffffff;
    vertical-alignment: center;
    horizontal-alignment: center;
  }
  /* Пустой контейнер */
  .empty-container {
    padding: 20;
  }
  /* Текст-muted */
  .text-muted {
    color: #888888;
  }
  .text-center {
    text-align: center;
  }
  </style>
  