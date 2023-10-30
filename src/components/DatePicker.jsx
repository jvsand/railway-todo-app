import { useState } from 'react';
import Calendar from 'react-calendar';
import './datepicker.scss';

function DatePicker({ onDateChange }) {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    onDateChange(newDate); // 親コンポーネントに選択された日付を伝える
  };

  return (
    <div>
      <Calendar onChange={handleDateChange} value={date} />
    </div>
  );
}

export default DatePicker;
