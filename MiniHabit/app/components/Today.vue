<template>
  <Page actionBarHidden="true" @navigatedTo="onNavigatedTo">
    <!-- Собственный header -->
    <GridLayout rows="auto" class="header">
      <Label text="Сегодня" class="header-title" verticalAlignment="center" horizontalAlignment="center" />
    </GridLayout>

    <StackLayout>
      <StackLayout v-if="todayPlans.length === 0" class="empty-container">
        <Label
          text="Нет планов на сегодня. Перейдите на вкладку «Добавить»."
          class="text-center text-muted"
        />
      </StackLayout>
      <ListView v-else for="(plan, index) in todayPlans">
        <v-template>
          <GridLayout class="plan-item" columns="*, auto">
            <StackLayout col="0">
              <Label :text="plan.title" class="plan-title" textWrap="true" />
              <Label :text="plan.time" class="plan-time" />
            </StackLayout>
            <Button text="✓" class="done-btn" @tap="markDone(plan)" col="1" />
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
      todayPlans: [],
    };
  },
  methods: {
    onNavigatedTo() {
      this.loadPlans();
      this.filterToday();
    },
    loadPlans() {
      const saved = settings.getString('plans', '[]');
      try {
        this.plans = JSON.parse(saved);
      } catch {
        this.plans = [];
      }
    },
    savePlans() {
      settings.setString('plans', JSON.stringify(this.plans));
    },
    filterToday() {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      let arr = this.plans.filter(plan => {
        if (plan.recurring) {
          return plan.lastDone !== todayStr;
        } else if (plan.date) {
          return plan.date === todayStr;
        }
        return false;
      });
      arr.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
      this.todayPlans = arr;
    },
    markDone(plan) {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      if (plan.recurring) {
        plan.lastDone = todayStr;
        this.savePlans();
      } else {
        const idx = this.plans.findIndex(p => p.id === plan.id);
        if (idx !== -1) {
          this.plans.splice(idx, 1);
          this.savePlans();
        }
      }
      this.filterToday();
      notificationService.initAndScheduleAll(this.plans);
    },
  },
  created() {
    this.loadPlans();
    this.filterToday();
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
.plan-item {
  background-color: #1e1e1e;
  border-radius: 12;
  padding: 16;
  margin: 5 16;
}
.plan-title {
  font-size: 18;
  font-weight: bold;
  color: #ffffff;
}
.plan-time {
  font-size: 14;
  color: #bbbbbb;
  margin-top: 4;
}
.done-btn {
  width: 40;
  height: 40;
  font-size: 14;
  border-radius: 20;
  background-color: #4ade80;
  color: #000000;
  vertical-alignment: center;
  horizontal-alignment: center;
}
.empty-container {
  padding: 20;
}
.text-muted {
  color: #888888;
}
.text-center {
  text-align: center;
}
</style>
