<!-- app/components/AddPlan.vue -->
<template>
    <!-- При каждом появлении этой страницы будем сбрасывать поля -->
    <Page actionBarHidden="true" @navigatedTo="onNavigatedTo">
      <ActionBar title="Новый план">
        <!-- Кнопка "назад" здесь не нужна, тк мы переключаем вкладку -->
      </ActionBar>
      <ScrollView>
        <StackLayout padding="16" spacing="16">
          <Label text="Название действия" />
          <TextField v-model="title" hint="Например: Выпить воду" />
  
          <Label text="Время" />
          <TimePicker v-model="timeObj" />
  
          <Label text="Дата (если одноразовый)" />
          <DatePicker v-model="dateObj" />
  
          <StackLayout orientation="horizontal" verticalAlignment="center">
            <Label text="Повторять каждый день" class="text-label" />
            <Switch v-model="recurring" />
          </StackLayout>
  
          <Button text="Добавить" @tap="savePlan" />
        </StackLayout>
      </ScrollView>
    </Page>
  </template>
  
  <script>
  export default {
    props: {
      onSave: {
        type: Function,
        required: true,
      },
    },
    data() {
      return {
        title: '',
        dateObj: new Date(),
        timeObj: new Date(),
        recurring: false,
      };
    },
    methods: {
      onNavigatedTo() {
        // Сбрасываем поля при каждом заходе на эту вкладку
        this.title = '';
        this.recurring = false;
        this.dateObj = new Date();
        this.timeObj = new Date();
      },
      savePlan() {
        const t = this.title.trim();
        if (!t) {
          return;
        }
        // Форматируем время "HH:mm"
        const h = this.timeObj.getHours();
        const m = this.timeObj.getMinutes();
        const hh = h < 10 ? '0' + h : '' + h;
        const mm = m < 10 ? '0' + m : '' + m;
        const timeStr = `${hh}:${mm}`;
        // Форматируем дату или null
        let dateStr = null;
        if (!this.recurring) {
          const y = this.dateObj.getFullYear();
          const mo = this.dateObj.getMonth() + 1;
          const d = this.dateObj.getDate();
          const mmth = mo < 10 ? '0' + mo : '' + mo;
          const dd = d < 10 ? '0' + d : '' + d;
          dateStr = `${y}-${mmth}-${dd}`;
        }
        // Вызываем callback
        this.onSave({
          title: t,
          time: timeStr,
          date: dateStr,
          recurring: this.recurring,
        });
        // После сохранения Home.vue переключит вкладку, а при возврате на AddPlan поля уже сбросятся через onNavigatedTo
      },
    },
  };
  </script>
  
  <style scoped>
  TextField{
    color: #FFF;
  }
  TimePicker{
    color: #FFF;
  }
  DatePicker{
    color: #FFF;
  }
  .text-label {
    color: #cccccc;
    margin-right: 8;
  }
  </style>
  