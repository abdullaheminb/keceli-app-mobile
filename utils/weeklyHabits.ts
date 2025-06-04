/**
 * Weekly Habits Utilities
 * 
 * Haftalık alışkanlıkların filtrelenmesi ve tamamlanma durumlarının
 * kontrolü için utility fonksiyonları.
 * 
 * @purpose Weekly habit filtering and completion logic
 */

import { Habit, HabitCompletion } from '../types';

// İngilizce gün adlarını Türkçe ile eşleştir
const DAY_MAP: { [key: string]: string } = {
  'Monday': 'Pazartesi',
  'Tuesday': 'Salı', 
  'Wednesday': 'Çarşamba',
  'Thursday': 'Perşembe',
  'Friday': 'Cuma',
  'Saturday': 'Cumartesi',
  'Sunday': 'Pazar'
};

/**
 * Seçili tarihin hangi gün olduğunu döndürür (İngilizce)
 */
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Haftalık habit'in belirli bir günde görünüp görünmeyeceğini kontrol eder
 */
export const shouldShowWeeklyHabit = (habit: Habit, selectedDate: string): boolean => {
  if (habit.type !== 'weekly') return false;
  
  const selectedDay = getDayOfWeek(selectedDate);
  
  // Eğer weekday "any" ise her gün göster
  if (habit.weekday === 'any') {
    return true;
  }
  
  // Eğer belirli bir gün belirtilmişse, sadece o günde göster
  return habit.weekday === selectedDay;
};

/**
 * Haftalık habit için o haftanın başlangıç ve bitiş tarihlerini döndürür
 * Hafta cumartesi başlar, cuma biter
 */
export const getWeekRange = (dateString: string): { start: string; end: string } => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Haftanın başlangıcını Cumartesi olarak ayarla
  const start = new Date(date);
  
  // Cumartesi'ye kadar geriye git
  // Eğer bugün cumartesi ise (6), 0 gün geriye git
  // Eğer bugün pazar ise (0), 1 gün geriye git
  // Eğer bugün pazartesi ise (1), 2 gün geriye git
  // ...
  // Eğer bugün cuma ise (5), 6 gün geriye git
  const daysToSaturday = day === 6 ? 0 : (day + 1);
  start.setDate(date.getDate() - daysToSaturday);
  
  // Haftanın sonu cuma (cumartesiden 6 gün sonra)
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Friday
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Haftalık habit'in o hafta kaç defa tamamlandığını sayar
 */
export const getWeeklyHabitCompletionCount = (
  habitId: string, 
  selectedDate: string, 
  allCompletions: HabitCompletion[]
): number => {
  const { start, end } = getWeekRange(selectedDate);
  
  return allCompletions.filter(completion => 
    completion.habitId === habitId && 
    completion.completed &&
    completion.date >= start &&
    completion.date <= end
  ).length;
};

/**
 * Haftalık habit'in tamamlanıp tamamlanmadığını kontrol eder
 */
export const isWeeklyHabitCompleted = (
  habit: Habit, 
  selectedDate: string, 
  allCompletions: HabitCompletion[]
): boolean => {
  if (habit.type !== 'weekly') return false;
  
  // Eğer "any" day ise, o spesifik günde tamamlanıp tamamlanmadığına bak
  if (habit.weekday === 'any') {
    return allCompletions.some(completion => 
      completion.habitId === habit.id && 
      completion.completed &&
      completion.date === selectedDate
    );
  }
  
  // Eğer belirli bir gün ise, o günde tamamlanıp tamamlanmadığına bak
  return allCompletions.some(completion => 
    completion.habitId === habit.id && 
    completion.completed &&
    completion.date === selectedDate
  );
};

/**
 * Haftalık habit'in disable olup olmadığını kontrol eder
 */
export const isWeeklyHabitDisabled = (
  habit: Habit,
  selectedDate: string,
  allCompletions: HabitCompletion[]
): boolean => {
  if (habit.type !== 'weekly') return false;
  
  // Eğer "any" day ise 
  if (habit.weekday === 'any') {
    // Eğer bu gün zaten tamamlanmışsa, disable etme (uncheck yapabilsin)
    const isCompletedToday = allCompletions.some(completion => 
      completion.habitId === habit.id && 
      completion.completed &&
      completion.date === selectedDate
    );
    
    if (isCompletedToday) {
      return false; // Tamamlanmış günler her zaman aktif (uncheck için)
    }
    
    // Eğer repeat sayısına ulaşılmışsa ve bugün tamamlanmamışsa disable et
    const completionCount = getWeeklyHabitCompletionCount(habit.id, selectedDate, allCompletions);
    return completionCount >= (habit.repeat || 1);
  }
  
  // Eğer belirli bir gün ise ve bugün o gün değilse disable et
  const selectedDay = getDayOfWeek(selectedDate);
  return habit.weekday !== selectedDay;
}; 