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
  const [selectedDate, setSelectedDate] = useState(null); // 新しく選択された日付を保持するステート
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);
  
  // 期日のフォーマットを行う関数
  // function formatLimitDate(limit) {
  //   const date = new Date(limit);
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const hour = date.getHours().toString().padStart(2, '0');
  //   const minute = date.getMinutes().toString().padStart(2, '0');
  //   return `${year}年${month}月${day}日 ${hour}:${minute}`;
  // }
  
  // formattedLimitを宣言
  // const formattedLimit = formatLimitDate(new Date().toISOString());
  
  // 日付のフォーマットを行う関数
  const formatSelectedDate = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 ${hour}:${minute}`;
    }
    return '日付未選択';
  };

  const onCreateTask = () => {
    const data = {
      title,
      detail,
      done: false,
      limit: selectedDate.toISOString(),
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
          <p>期日: {formatSelectedDate(selectedDate)}</p>
          <DatePicker onDateChange={setSelectedDate} />
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
