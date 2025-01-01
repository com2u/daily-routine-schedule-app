import React, { useState, useEffect } from 'react';
import { fetchDailyData, saveDailyData } from './api';
import TodoSection from './TodoSection';
import ScheduleSection from './ScheduleSection';
import RoutinesSection from './RoutinesSection';
import MemoSection from './MemoSection';
import Splitter from './Splitter';
import DateNavigation from './DateNavigation';

const DailyRoutine = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [colSizes, setColSizes] = useState({ todo: 3, schedule: 2, routines: 2, memo: 4 });
    const [todoText, setTodoText] = useState('');
    const [todos, setTodos] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [memo, setMemo] = useState('');
    const [loading, setLoading] = useState(true);

    const initialRoutines = [
        { name: 'Become ready', done: false },
        { name: 'Drink Water', 'done': false },
        { name: 'Medication AM', 'done': false },
        { name: 'Medication PM', 'done': false },
        { name: 'Vinegar AM', 'done': false },
        { name: 'Vinegar PM', 'done': false },
        { name: 'Sport 1', 'done': false },
        { name: 'Sport 2', 'done': false },
        { name: 'Sport 3', 'done': false },
        { name: 'Cleanup 1', 'done': false },
        { name: 'Cleanup 2', 'done': false },
        { name: 'Cleanup 3', 'done': false },
        { name: 'Eat healthy', done: false },
        { name: 'Walk', done: false },
        { name: 'Be outside', done: false },
        { name: 'Improve project', 'done': false },
        { name: 'Commit', 'done': false }
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const dateStr = currentDate.toISOString().split('T')[0];
                const data = await fetchDailyData(dateStr);

                if (data) {
                    setTodoText(data.todos?.map(todo => todo.text).join('\n') || '');
                    setTodos(data.todos || []);
                    setSchedule(data.schedule || []);
                    setRoutines(data.routines || (data.routines === undefined ? initialRoutines : []));
                    setMemo(data.memo || '');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentDate]);

    useEffect(() => {
        const saveData = async () => {
            if (loading) return;

            try {
                const dateStr = currentDate.toISOString().split('T')[0];
                await saveDailyData(dateStr, { todos, schedule, routines, memo });
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };

        const timeoutId = setTimeout(saveData, 1000);
        return () => clearTimeout(timeoutId);
    }, [todos, schedule, routines, memo, currentDate, loading]);

    const handleResize = (section, newSize, adjustSection) => {
        setColSizes(prev => ({ ...prev, [section]: newSize, [adjustSection]: prev[adjustSection] - (newSize - prev[section]) }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 w-full">
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <DateNavigation currentDate={currentDate} setCurrentDate={setCurrentDate} />
                <div className="flex">
                    {/* ... (Sections and Splitters - no changes here) */}
                    <div style={{ flex: colSizes.todo }}>
                        <TodoSection 
                            todoText={todoText} 
                            setTodoText={setTodoText} 
                            todos={todos} 
                            setTodos={setTodos} 
                            currentDate={currentDate}
                        />
                    </div>
                    <Splitter onResize={(diff) => handleResize('todo', Math.max(1, Math.min(6, colSizes.todo + diff)), 'schedule')} />
                    <div style={{ flex: colSizes.schedule }}>
                        <ScheduleSection schedule={schedule} setSchedule={setSchedule} />
                    </div>
                    <Splitter onResize={(diff) => handleResize('schedule', Math.max(1, Math.min(6, colSizes.schedule + diff)), 'routines')} />
                    <div style={{ flex: colSizes.routines }}>
                        <RoutinesSection routines={routines} setRoutines={setRoutines} />
                    </div>
                    <Splitter onResize={(diff) => handleResize('routines', Math.max(1, Math.min(6, colSizes.routines + diff)), 'memo')} />
                    <div style={{ flex: colSizes.memo }}>
                        <MemoSection memo={memo} setMemo={setMemo} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyRoutine;
