import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { url } from '../const';
import { Header } from '../components/Header';
import './editTask.scss';
import DatePicker from '../components/DatePicker';

export function EditTask() {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [isDone, setIsDone] = useState();
  const [selectedDate, setSelectedDate] = useState(null); // 新しく選択された日付を保持するステート
  const [disp_limit, setDispLimit] = useState('日付未選択'); // 表示用の日付フォーマット
  const [req_limit, setReqLimit] = useState(null); // リクエスト用の日付フォーマット
  const [selectedHour, setSelectedHour] = useState(0); // 選択された時間
  const [selectedMinute, setSelectedMinute] = useState(0); // 選択された分
  const [errorMessage, setErrorMessage] = useState('');
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done');

  // 日付のフォーマットを行う関数
  const formatDisplayDate = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 `;
    }
    return '日付未選択';
  };

  const handleHourChange = (e) => {
    setSelectedHour(parseInt(e.target.value, 10));
    setReqLimit(formatRequestDate(selectedDate, parseInt(e.target.value, 10), selectedMinute));
  };
  const handleMinuteChange = (e) => {
    setSelectedMinute(parseInt(e.target.value, 10));
    setReqLimit(formatRequestDate(selectedDate, selectedHour, parseInt(e.target.value, 10)));
  };

  const formatRequestDate = (date, hour, minute) => {
    if (date && Number.isInteger(hour) && Number.isInteger(minute)) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      return `${year}-${month}-${day}T${formattedHour}:${formattedMinute}:00Z`;
    }
    return null;
  };


  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDispLimit(formatDisplayDate(date)); // 表示用フォーマットに変換
    setReqLimit(formatRequestDate(date, selectedHour, selectedMinute)); // リクエスト用フォーマットに変換
  };

  const onUpdateTask = () => {
    console.log(isDone);
    const data = {
      title,
      detail,
      done: isDone,
      limit: req_limit,
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, [cookies.token, listId, taskId]);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <p>期日: {disp_limit}</p>
          <label htmlFor="hour">時間</label>
          <select onChange={handleHourChange} className="new-task-hour">
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <label htmlFor="minute">分</label>
          <select onChange={handleMinuteChange} className="new-task-minute">
            <option value={0}>0分</option>
            <option value={15}>15分</option>
            <option value={30}>30分</option>
            <option value={45}>45分</option>
          </select>
          <DatePicker onDateChange={handleDateChange} />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
}
