// app/utils/notificationService.js
import { LocalNotifications } from '@nativescript/local-notifications';
import * as settings from '@nativescript/core/application-settings';

export default {
  /**
   * Инициализация: проверяем/запрашиваем разрешения и планируем все уведомления из массива plans.
   */
  async initAndScheduleAll(plans) {
    try {
      // Проверяем разрешение
      const perm = await LocalNotifications.hasPermission();
      if (!perm) {
        try {
          await LocalNotifications.requestPermission();
        } catch (ignoreErr) {
          console.warn('Запрос разрешения не поддерживается или отказано', ignoreErr);
        }
      }
    } catch (e) {
      console.warn('Ошибка при проверке разрешения на уведомления', e);
    }

    // Отменяем все ранее запланированные уведомления
    if (typeof LocalNotifications.cancelAll === 'function') {
      try {
        await LocalNotifications.cancelAll();
      } catch (e) {
        console.warn('LocalNotifications.cancelAll не сработал', e);
      }
    } else {
      console.warn('LocalNotifications.cancelAll не определён; уведомления могут дублироваться');
    }

    // Планируем новые по списку plans
    this.scheduleAll(plans);
  },

  /**
   * Планирует уведомления для каждого плана из массива plans.
   * Структура plan:
   * {
   *   id: Number,
   *   title: String,
   *   date: String|null,    // "YYYY-MM-DD" или null для ежедневного
   *   time: String,         // "HH:mm"
   *   recurring: Boolean,
   *   lastDone: String|null // "YYYY-MM-DD" или null
   * }
   */
  scheduleAll(plans) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const requests = [];

    for (const plan of plans) {
      const [hh, mm] = plan.time.split(':').map(n => parseInt(n, 10));
      if (plan.recurring) {
        // Ежедневный
        if (plan.lastDone === todayStr) {
          // Уже выполнен сегодня — планируем на завтра
          const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm);
          requests.push({ id: plan.id, title: plan.title, at: dt });
        } else {
          // Не выполнен сегодня: если время ещё не прошло — сегодня, иначе — завтра
          let dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
          if (dt <= now) {
            dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm);
          }
          requests.push({ id: plan.id, title: plan.title, at: dt });
        }
      } else if (plan.date) {
        // Одноразовый: планируем только если дата-время в будущем
        const [y, mo, d] = plan.date.split('-').map(n => parseInt(n, 10));
        const dt = new Date(y, mo - 1, d, hh, mm);
        if (dt > now) {
          requests.push({ id: plan.id, title: plan.title, at: dt });
        }
      }
    }

    // Преобразуем в формат LocalNotifications.schedule
    const schedules = requests.map(item => ({
      id: item.id,
      title: 'Напоминание',
      body: `Пора: ${item.title}`,
      at: item.at,
      // sound: null, // если нужно без звука
    }));

    if (schedules.length > 0) {
      LocalNotifications.schedule(schedules)
        .then(() => {
          console.log('Notifications scheduled:', schedules);
        })
        .catch(err => {
          console.warn('Не удалось запланировать уведомления', err);
        });
    }
  },
};
