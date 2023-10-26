import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { url } from '../const';
import { Header } from '../components/Header';
import './newTask.scss';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';

export function NewTask() {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [, setSelectedDate] = useState(null); // 新しく選択された日付を保持するステート
  const [disp_limit, setDispLimit] = useState('日付未選択'); // 表示用の日付フォーマット
  const [req_limit, setReqLimit] = useState(null); // リクエスト用の日付フォーマット
  const [selectedHour, setSelectedHour] = useState(0); // 選択された時間
  const [selectedMinute, setSelectedMinute] = useState(0); // 選択された分
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);

  // 日付のフォーマットを行う関数
  const formatDisplayDate = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      // const hour = date.getHours().toString().padStart(2, '0');
      // const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 `;
    }
    return '日付未選択';
  };

  const handleHourChange = (e) => {
    setSelectedHour(parseInt(e.target.value, 10));
  };

  const handleMinuteChange = (e) => {
    setSelectedMinute(parseInt(e.target.value, 10));
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

  const onCreateTask = () => {
    const data = {
      title,
      detail,
      done: false,
      limit: req_limit,
    };

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        setSelectListId(res.data[0]?.id);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, [cookies.token]);

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label htmlFor="list">リスト</label> {/* htmlFor属性を追加 */}
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            className="new-task-select-list"
          >
            {lists.map((list, key) => (
              <option key={key} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label htmlFor="title">タイトル</label> {/* htmlFor属性を追加 */}
          <br />
          <input
            type="text"
            id="title"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label htmlFor="detail">詳細</label> {/* htmlFor属性を追加 */}
          <br />
          <textarea
            id="detail"
            type="text"
            onChange={handleDetailChange}
            className="new-task-detail"
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
          {/* <select
            onChange={handleMinuteChange}
            className="new-task-minute"
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select> */}
          <DatePicker onDateChange={handleDateChange} />
          <br />
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
}
