import React, { useState, useEffect } from 'react';
import { fetchAllUsers, deleteUser, updateAdminUser, createNewUser } from '../services/adminService';
import useAuthStore from '../store/authStore';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaUsers } from 'react-icons/fa';
import type { User, UserRegistrationDTO } from '../types/user'; 
import '../styles/Admin.css'; 

const AdminUserManagement: React.FC = () => {
    // 🛑 CORRECCIÓN CLAVE: Usar selectores individuales para evitar el loop infinito.
    // Esto asegura que solo se re-renderice cuando el valor de 'user' o 'token' cambie.
    const user = useAuthStore(state => state.user);
    const token = useAuthStore(state => state.token);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Opciones estáticas para el select (Asegúrate de que coincidan con tu backend)
    const ROLES = ['USER', 'ADMIN'];
    const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];

    // ==========================================================
    // --- LÓGICA DE CARGA Y ESTADO ---
    // ==========================================================
    const loadUsers = async () => {
        // Validación de permisos. Es mejor bloquear el acceso si no es ADMIN.
        if (!token || user?.role !== 'ADMIN') {
            setError('Acceso denegado. Solo administradores pueden ver esta página.');
            setLoading(false);
            setUsers([]);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const fetchedUsers = await fetchAllUsers(token);
            setUsers(fetchedUsers);
        } catch (err: any) {
            // Mostrar un error más específico para el 403
            const errorMessage = err.message.includes('403') ? 
                'Error 403: No tienes permisos de administrador.' : 
                (err.message || "No se pudo cargar la lista de usuarios.");
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // useEffect se dispara cuando 'token' o 'user' cambian,
    // pero el componente solo se re-renderiza si sus valores cambian, no por la creación del objeto.
    useEffect(() => {
        loadUsers();
    }, [token, user?.role]); // Dependencias correctas

    // ==========================================================
    // --- LÓGICA DE OVERLAY/MODAL ---
    // ==========================================================

    const openCreateModal = () => {
        setSelectedUser(null);
        setModalMode('create');
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setModalMode('edit');
        setError('');
        setIsModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setModalMode('delete');
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setError(''); // Limpiar errores del modal
    };

    // ==========================================================
    // --- LÓGICA CRUD ---
    // ==========================================================

    const handleCreate = async (data: UserRegistrationDTO) => {
        if (!token) return;
        try {
            setLoading(true);
            const newUser = await createNewUser(data, token);
            setUsers([...users, newUser]);
            closeModal();
        } catch (err: any) {
            setError(err.message || 'Fallo la creación del usuario.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (userId: number, data: any) => {
        if (!token) return;
        try {
            setLoading(true);
            // El backend solo necesita 'role' y 'currentLevel' para el update de admin
            const adminUpdateData = { 
                role: data.role, 
                currentLevel: data.currentLevel 
            };
            const updatedUser = await updateAdminUser(userId, adminUpdateData, token);
            
            // También actualizamos en el frontend los campos de perfil si se enviaron (fullName, email)
            setUsers(users.map(u => u.id === userId ? 
                { ...u, ...updatedUser, fullName: data.fullName, email: data.email } : u));
            
            closeModal();
        } catch (err: any) {
            setError(err.message || 'Fallo la actualización del usuario.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!token) return;
        try {
            setLoading(true);
            await deleteUser(userId, token);
            setUsers(users.filter(u => u.id !== userId));
            closeModal();
        } catch (err: any) {
            setError(err.message || 'Fallo la eliminación del usuario.');
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // --- RENDERIZADO DE CONTENIDO DE OVERLAY ---
    // ==========================================================

    const renderModalContent = () => {
        if (modalMode === 'delete' && selectedUser) {
            return (
                <div className="modal-content">
                    <h3>Confirmar Eliminación</h3>
                    <p>¿Estás seguro de que deseas eliminar al usuario **{selectedUser.username}**?</p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                        <button onClick={closeModal} className="btn-secondary" disabled={loading}>Cancelar</button>
                        <button onClick={() => handleDelete(selectedUser.id)} className="btn-danger" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : 'Eliminar'}
                        </button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                </div>
            );
        }
        
        if (modalMode === 'edit' && selectedUser) {
            return (
                <div className="modal-content">
                    <h3>Editar Usuario: {selectedUser.username}</h3>
                    <EditUserForm 
                        user={selectedUser} 
                        onSave={handleUpdate} 
                        onClose={closeModal} 
                        roles={ROLES} 
                        levels={LEVELS} 
                        loading={loading} 
                    />
                    {error && <p className="error-message">{error}</p>}
                </div>
            );
        }

        if (modalMode === 'create') {
            return (
                <div className="modal-content">
                    <h3>Crear Nuevo Usuario</h3>
                    <CreateUserForm 
                        onSave={handleCreate} 
                        onClose={closeModal} 
                        roles={ROLES} 
                        loading={loading} 
                    />
                    {error && <p className="error-message">{error}</p>}
                </div>
            );
        }
        
        return null;
    };


    if (user?.role !== 'ADMIN' && !loading) {
        return <div className="error-container">Permisos insuficientes para acceder a esta página.</div>;
    }
    
    if (loading && users.length === 0) {
        return <div className="loading-container"><FaSpinner className="spinner" /> Cargando usuarios...</div>;
    }

    // ==========================================================
    // --- RENDERIZADO PRINCIPAL ---
    // ==========================================================

    return (
        <div className="admin-container">
            <h1 className="admin-title"><FaUsers /> Gestión de Usuarios</h1>
            
            <button onClick={openCreateModal} className="btn-primary btn-add">
                <FaPlus /> Crear Nuevo Usuario
            </button>

            {/* Error general fuera del modal */}
            {error && !isModalOpen && <p className="error-message">{error}</p>} 

            <div className="table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Nivel</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.currentLevel}</td>
                                <td>{u.role}</td>
                                <td className="actions-cell">
                                    <button onClick={() => openEditModal(u)} className="btn-action edit" title="Editar">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => openDeleteModal(u)} className="btn-action delete" title="Eliminar">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Overlay/Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    {/* Evita que el click dentro del modal lo cierre */}
                    <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}> 
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;


// ==========================================================
// --- COMPONENTE AUXILIAR: FORMULARIO DE EDICIÓN ---
// ==========================================================

interface EditUserFormProps {
    user: User;
    onSave: (userId: number, data: any) => void;
    onClose: () => void;
    roles: string[];
    levels: string[];
    loading: boolean;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSave, onClose, roles, levels, loading }) => {
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(user.id, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="form-edit">
            <p>Editando usuario: **{user.username}**</p>
            
            <label>Nombre Completo</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />

            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            
            <label>Rol</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <label>Nivel Actual</label>
            <select name="currentLevel" value={formData.currentLevel} onChange={handleChange} required>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};


// ==========================================================
// --- COMPONENTE AUXILIAR: FORMULARIO DE CREACIÓN ---
// ==========================================================

interface CreateUserFormProps {
    onSave: (data: UserRegistrationDTO) => void;
    onClose: () => void;
    roles: string[];
    loading: boolean;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSave, onClose, roles, loading }) => {
    const [formData, setFormData] = useState<UserRegistrationDTO>({
        username: '',
        email: '',
        password: '',
        fullName: '',
        adminCode: '', 
    });

    const [role, setRole] = useState('USER');
    // 🛑 IMPORTANTE: Este código debe coincidir EXACTAMENTE con el ADMIN_SECRET_CODE en tu UserService.kt
    const ADMIN_CODE = "SUPERCLAVE2025"; 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRole = e.target.value;
        setRole(selectedRole);
        // Ajustar el adminCode: si es ADMIN, envía la clave secreta; si es USER, envía nulo.
        setFormData(prev => ({ 
            ...prev, 
            adminCode: selectedRole === 'ADMIN' ? ADMIN_CODE : null,
        } as UserRegistrationDTO)); // Se usa 'as UserRegistrationDTO' para asegurar el tipo si 'adminCode' es opcional (null)
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="form-create">
            <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Contraseña (Mín. 6)" value={formData.password} onChange={handleChange} required />
            <input type="text" name="fullName" placeholder="Nombre Completo (Opcional)" value={formData.fullName || ''} onChange={handleChange} />
            
            <label>Rol Inicial</label>
            <select name="role" value={role} onChange={handleRoleChange} required>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            
            <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Crear Usuario'}
                </button>
            </div>
        </form>
    );
};