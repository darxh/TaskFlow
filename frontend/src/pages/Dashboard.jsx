import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';
import toast, { Toaster } from 'react-hot-toast';
import { LogOut, Plus, Search, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    
    // Form & Filter State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch Tasks
    const fetchTasks = async () => {
        try {
            const { data } = await api.get(`/tasks?search=${searchQuery}&status=${statusFilter}`);
            setTasks(data.tasks);
        } catch (error) {
            toast.error('Failed to load tasks');
        }
    };

    // Re-fetch when search or filter changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTasks();
        }, 300); // Debounce search to avoid spamming the API
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter]);

    // Create Task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return toast.error('Title and Description are required');
        
        try {
            await api.post('/tasks', { title, description });
            setTitle('');
            setDescription('');
            toast.success('Task created successfully');
            fetchTasks();
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    // Toggle Task Status
    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'completed' ? 'pending' : currentStatus === 'pending' ? 'in-progress' : 'completed';
        try {
            await api.put(`/tasks/${id}`, { status: nextStatus });
            fetchTasks();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Delete Task
    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            toast.success('Task deleted');
            fetchTasks();
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'completed') return <CheckCircle className="text-emerald-500 w-5 h-5" />;
        if (status === 'in-progress') return <Clock className="text-amber-500 w-5 h-5" />;
        return <Circle className="text-slate-500 w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
            
            {/* Top Navigation */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h1 className="text-lg font-semibold tracking-tight">{user?.name}'s Space</h1>
                    </div>
                    <button onClick={logout} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Column: Create Task */}
                <div className="md:col-span-4 space-y-6">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">New Task</h2>
                        <form onSubmit={handleCreateTask} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder-slate-500 mb-2 outline-none"
                            />
                            <textarea
                                placeholder="Add a description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-400 placeholder-slate-600 resize-none h-24 outline-none"
                            />
                            <div className="flex justify-end mt-2 pt-3 border-t border-slate-700/50">
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md shadow-indigo-900/20">
                                    <Plus className="w-4 h-4" /> Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Task List & Filters */}
                <div className="md:col-span-8 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 appearance-none min-w-[140px] text-slate-300"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-xl">
                                No tasks found. Create one to get started.
                            </div>
                        ) : (
                            tasks.map(task => (
                                <div key={task._id} className="group bg-slate-800/30 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 transition-all flex gap-4">
                                    <button onClick={() => toggleStatus(task._id, task.status)} className="mt-1 flex-shrink-0">
                                        {getStatusIcon(task.status)}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-base font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                                    </div>
                                    <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0 p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;