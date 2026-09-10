import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Users,
    UserRound,
    Building2,
    Search,
    CheckCircle2,
    X,
    UserPlus,
    Mail,
    Phone,
    BriefcaseBusiness,
    ShieldCheck,
    Power,
    AlertTriangle,
    Pencil,
    LockKeyhole,
} from "lucide-react";

import {
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
} from "../services/api";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    // Add modal
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        employeeCode: "",
        name: "",
        email: "",
        department: "",
        otherDepartment: "",
        role: "",
        phone: "",
        password: "",
    });

    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const [editFormData, setEditFormData] = useState({
        employeeCode: "",
        name: "",
        email: "",
        department: "",
        otherDepartment: "",
        role: "",
        phone: "",
        password: "",
    });

    const [editFormError, setEditFormError] = useState("");
    const [editFormLoading, setEditFormLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    // Status confirmation
    const [statusEmployee, setStatusEmployee] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    // --------------------------------------------------
    // FETCH EMPLOYEES
    // --------------------------------------------------

    const fetchEmployees = async () => {
        try {
            setLoading(true);

            const data = await apiGet("/employees");

            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            showToast(
                "Unable to load employees. Please try again.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // --------------------------------------------------
    // TOAST
    // --------------------------------------------------

    const showToast = (message, type = "success") => {
        setToast({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setToast((previous) => ({
                ...previous,
                show: false,
            }));
        }, 3000);
    };

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const filteredEmployees = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return employees;
        }

        return employees.filter((employee) => {
            return [
                employee.employeeCode,
                employee.name,
                employee.email,
                employee.department,
                employee.role,
                employee.phone,
                employee.accountRole,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(search)
                );
        });
    }, [employees, searchTerm]);

    // --------------------------------------------------
    // FORM CHANGE
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // RESET ADD FORM
    // --------------------------------------------------

    const resetForm = () => {
        setFormData({
            employeeCode: "",
            name: "",
            email: "",
            department: "",
            otherDepartment: "",
            role: "",
            phone: "",
            password: "",
        });

        setFormError("");
    };

    // --------------------------------------------------
    // ADD MODAL
    // --------------------------------------------------

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        if (formLoading) return;

        setShowAddModal(false);
        resetForm();
    };

    // --------------------------------------------------
    // ADD EMPLOYEE
    // --------------------------------------------------

    const handleAddEmployee = async (event) => {
        event.preventDefault();

        setFormError("");

        const employeeCode =
            formData.employeeCode.trim();

        const name =
            formData.name.trim();

        const email =
            formData.email.trim();

        const role =
            formData.role.trim();

        const phone =
            formData.phone.trim();

        let department =
            formData.department;

        if (!employeeCode || !name || !email || !department || !role) {
            setFormError(
                "Please fill in all required fields."
            );
            return;
        }

        if (department === "Other") {
            department =
                formData.otherDepartment.trim();

            if (!department) {
                setFormError(
                    "Please enter the department name."
                );
                return;
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormError(
                "Please enter a valid email address."
            );
            return;
        }

        if (formData.password.length < 8) {
            setFormError(
                "Password must be at least 8 characters."
            );
            return;
        }

        try {
            setFormLoading(true);

            const employeeData = {
                employeeCode,
                name,
                email,
                department,
                role,
                phone,
                password: formData.password,
                accountRole: "EMPLOYEE",
                active: true,
            };

            const createdEmployee = await apiPost(
                "/employees/register",
                employeeData
            );

            setEmployees((previous) => [
                createdEmployee,
                ...previous,
            ]);

            setShowAddModal(false);
            resetForm();

            showToast(
                "Employee added successfully.",
                "success"
            );
        } catch (error) {
            setFormError(
                "Unable to add employee. Please try again."
            );
        } finally {
            setFormLoading(false);
        }
    };

    // --------------------------------------------------
    // EDIT MODAL
    // --------------------------------------------------

    const openEditModal = (employee) => {
        setEditingEmployee(employee);

        const knownDepartments = [
            "Development",
            "development",
            "HR",
            "hr",
        ];

        const employeeDepartment =
            employee.department || "";

        const isKnownDepartment =
            knownDepartments.includes(
                employeeDepartment
            );

        setEditFormData({
            employeeCode:
                employee.employeeCode || "",

            name:
                employee.name || "",

            email:
                employee.email || "",

            department:
                isKnownDepartment
                    ? employeeDepartment
                    : "Other",

            otherDepartment:
                isKnownDepartment
                    ? ""
                    : employeeDepartment,

            role:
                employee.role || "",

            phone:
                employee.phone || "",

            password: "",
        });

        setEditFormError("");
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (editFormLoading) return;

        setShowEditModal(false);
        setEditingEmployee(null);

        setEditFormData({
            employeeCode: "",
            name: "",
            email: "",
            department: "",
            otherDepartment: "",
            role: "",
            phone: "",
            password: "",
        });

        setEditFormError("");
    };

    // --------------------------------------------------
    // EDIT EMPLOYEE
    // --------------------------------------------------

    const handleEditEmployee = async (event) => {
        event.preventDefault();

        setEditFormError("");

        if (!editingEmployee) {
            return;
        }

        const employeeCode =
            editFormData.employeeCode.trim();

        const name =
            editFormData.name.trim();

        const email =
            editFormData.email.trim();

        const role =
            editFormData.role.trim();

        const phone =
            editFormData.phone.trim();

        let department =
            editFormData.department;

        if (
            !employeeCode ||
            !name ||
            !email ||
            !department ||
            !role
        ) {
            setEditFormError(
                "Please fill in all required fields."
            );
            return;
        }

        if (department === "Other") {
            department =
                editFormData.otherDepartment.trim();

            if (!department) {
                setEditFormError(
                    "Please enter the department name."
                );
                return;
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEditFormError(
                "Please enter a valid email address."
            );
            return;
        }

        // Password is optional during edit.
        // Only validate it if the user entered one.
        if (
            editFormData.password &&
            editFormData.password.length < 8
        ) {
            setEditFormError(
                "New password must be at least 8 characters."
            );
            return;
        }

        try {
            setEditFormLoading(true);

            const employeeData = {
                employeeCode,
                name,
                email,
                department,
                role,
                phone,
            };

            // Do NOT send an empty password.
            // Backend will keep the existing password.
            if (editFormData.password.trim()) {
                employeeData.password =
                    editFormData.password.trim();
            }

            const updatedEmployee = await apiPut(
                `/employees/${editingEmployee.id}`,
                employeeData
            );

            setEmployees((previous) =>
                previous.map((employee) =>
                    employee.id === editingEmployee.id
                        ? updatedEmployee
                        : employee
                )
            );

            closeEditModal();

            showToast(
                "Employee updated successfully.",
                "success"
            );
        } catch (error) {
            setEditFormError(
                "Unable to update employee status. Please try again."
            );
        } finally {
            setEditFormLoading(false);
        }
    };

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    const openStatusConfirmation = (employee) => {
        setStatusEmployee(employee);
    };

    const closeStatusConfirmation = () => {
        if (statusLoading) return;

        setStatusEmployee(null);
    };

    const handleStatusChange = async () => {
        if (!statusEmployee) {
            return;
        }

        try {
            setStatusLoading(true);

            const newStatus =
                !statusEmployee.active;

            const updatedEmployee =
                await apiPatch(
                    `/employees/${statusEmployee.id}/status?active=${newStatus}`
                );

            setEmployees((previous) =>
                previous.map((employee) =>
                    employee.id === statusEmployee.id
                        ? updatedEmployee
                        : employee
                )
            );

            showToast(
                newStatus
                    ? "Employee activated successfully."
                    : "Employee deactivated successfully.",
                "success"
            );

            setStatusEmployee(null);
        } catch {
            showToast(
                "Unable to load employees. Please try again.",
                "error"
            );
        } finally {
            setStatusLoading(false);
        }
    };

    // --------------------------------------------------
    // STATS
    // --------------------------------------------------

    const totalEmployees =
        employees.length;

    const activeEmployees =
        employees.filter(
            (employee) => employee.active
        ).length;

    const inactiveEmployees =
        employees.filter(
            (employee) => !employee.active
        ).length;

    // --------------------------------------------------
    // DEPARTMENT DISPLAY
    // --------------------------------------------------

    const departmentOptions = [
        "Development",
        "HR",
        "Other",
    ];

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#F4EFFA] p-4 sm:p-6 lg:p-8">

            {/* Ambient background */}

            <motion.div
                className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C8B1E4]/40 blur-3xl"
                animate={{
                    x: [0, 30, 0],
                    y: [0, 20, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#9B72CF]/20 blur-3xl"
                animate={{
                    x: [0, -25, 0],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">

                {/* HEADER */}

                <div className="mb-8">

                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#532B88]">
                        <Users size={17} />
                        <span>Organization</span>
                        <span className="text-[#9B72CF]">
                            /
                        </span>
                        <span className="text-gray-500">
                            Employees
                        </span>
                    </div>

                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">
                                Employees
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                                Manage WorkPulse employees,
                                departments and account
                                status.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition hover:bg-[#2F184B] active:scale-[0.98]"
                        >
                            <UserPlus size={18} />
                            Add Employee
                        </button>

                    </div>
                </div>

                {/* STATS */}

                <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
                    >
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-[#2F184B]">
                                    {totalEmployees}
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#F4EFFA] p-3 text-[#532B88]">
                                <Users size={23} />
                            </div>

                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
                    >
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Active Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    {activeEmployees}
                                </p>
                            </div>

                            <div className="rounded-xl bg-green-50 p-3 text-green-600">
                                <CheckCircle2 size={23} />
                            </div>

                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
                    >
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Inactive Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-500">
                                    {inactiveEmployees}
                                </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-red-500">
                                <Power size={23} />
                            </div>

                        </div>
                    </motion.div>

                </div>

                {/* DIRECTORY */}

                <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-[#532B88]/5 backdrop-blur">

                    {/* Directory Header */}

                    <div className="border-b border-gray-100 p-5 sm:p-6">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div>
                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Employee Directory
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {filteredEmployees.length}{" "}
                                    employee
                                    {filteredEmployees.length !==
                                        1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-sm">

                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search employees..."
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                />

                            </div>

                        </div>

                    </div>

                    {/* Loading */}

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">

                            <div className="flex flex-col items-center gap-3">

                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#C8B1E4] border-t-[#532B88]" />

                                <p className="text-sm text-gray-500">
                                    Loading employees...
                                </p>

                            </div>

                        </div>
                    ) : filteredEmployees.length === 0 ? (

                        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                            <div className="mb-4 rounded-2xl bg-[#F4EFFA] p-4 text-[#532B88]">
                                <Users size={30} />
                            </div>

                            <h3 className="text-lg font-semibold text-[#2F184B]">
                                No employees found
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-gray-500">
                                Try changing your search
                                or add a new employee.
                            </p>

                        </div>

                    ) : (

                        <>
                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full">

                                    <thead>
                                        <tr className="border-b border-gray-100 bg-[#F4EFFA]/60 text-left">

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Employee
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Employee Code
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Department
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Role
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Contact
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Account
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#532B88]">
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {filteredEmployees.map(
                                            (employee) => (
                                                <motion.tr
                                                    key={
                                                        employee.id
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="transition hover:bg-[#F4EFFA]/40"
                                                >

                                                    {/* Employee */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                                                <UserRound
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-[#2F184B]">
                                                                    {
                                                                        employee.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        employee.email
                                                                    }
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Code */}

                                                    <td className="px-6 py-4">

                                                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                            {
                                                                employee.employeeCode
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* Department */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-gray-700">

                                                            <Building2
                                                                size={
                                                                    16
                                                                }
                                                                className="text-[#9B72CF]"
                                                            />

                                                            {
                                                                employee.department ||
                                                                "—"
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* Role */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-gray-700">

                                                            <BriefcaseBusiness
                                                                size={
                                                                    16
                                                                }
                                                                className="text-[#9B72CF]"
                                                            />

                                                            {
                                                                employee.role ||
                                                                "—"
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* Contact */}

                                                    <td className="px-6 py-4">

                                                        <div className="space-y-1">

                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <Mail
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                                {
                                                                    employee.email
                                                                }
                                                            </div>

                                                            {employee.phone && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <Phone
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    {
                                                                        employee.phone
                                                                    }
                                                                </div>
                                                            )}

                                                        </div>

                                                    </td>

                                                    {/* Account */}

                                                    <td className="px-6 py-4">

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4EFFA] px-3 py-1 text-xs font-semibold text-[#532B88]">

                                                            <ShieldCheck
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            {employee.accountRole ||
                                                                "EMPLOYEE"}

                                                        </span>

                                                    </td>

                                                    {/* Status */}

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${employee.active
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-600"
                                                                }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${employee.active
                                                                    ? "bg-green-500"
                                                                    : "bg-red-500"
                                                                    }`}
                                                            />

                                                            {employee.active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>

                                                    </td>

                                                    {/* Actions */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center justify-end gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        employee
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8B1E4] bg-white px-3 py-2 text-xs font-semibold text-[#532B88] transition hover:bg-[#F4EFFA]"
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openStatusConfirmation(
                                                                        employee
                                                                    )
                                                                }
                                                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${employee.active
                                                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                                                    }`}
                                                            >
                                                                <Power
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                {employee.active
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                            </button>

                                                        </div>

                                                    </td>

                                                </motion.tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* MOBILE / TABLET CARDS */}

                            <div className="grid gap-4 p-4 md:hidden">

                                {filteredEmployees.map(
                                    (employee) => (
                                        <motion.div
                                            key={
                                                employee.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                                                        <UserRound
                                                            size={
                                                                20
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">

                                                        <h3 className="truncate font-bold text-[#2F184B]">
                                                            {
                                                                employee.name
                                                            }
                                                        </h3>

                                                        <p className="truncate text-xs text-gray-500">
                                                            {
                                                                employee.email
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${employee.active
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-600"
                                                        }`}
                                                >
                                                    {employee.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                                <div className="rounded-xl bg-[#F4EFFA]/60 p-3">

                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                        Employee Code
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[#2F184B]">
                                                        {
                                                            employee.employeeCode
                                                        }
                                                    </p>

                                                </div>

                                                <div className="rounded-xl bg-[#F4EFFA]/60 p-3">

                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                        Department
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[#2F184B]">
                                                        {
                                                            employee.department ||
                                                            "—"
                                                        }
                                                    </p>

                                                </div>

                                                <div className="rounded-xl bg-[#F4EFFA]/60 p-3">

                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                        Role
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[#2F184B]">
                                                        {
                                                            employee.role ||
                                                            "—"
                                                        }
                                                    </p>

                                                </div>

                                                <div className="rounded-xl bg-[#F4EFFA]/60 p-3">

                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                        Account
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[#532B88]">
                                                        {employee.accountRole ||
                                                            "EMPLOYEE"}
                                                    </p>

                                                </div>

                                            </div>

                                            {employee.phone && (
                                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                                    <Phone
                                                        size={
                                                            15
                                                        }
                                                    />
                                                    {
                                                        employee.phone
                                                    }
                                                </div>
                                            )}

                                            <div className="mt-4 flex gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            employee
                                                        )
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#C8B1E4] px-3 py-2.5 text-sm font-semibold text-[#532B88] transition hover:bg-[#F4EFFA]"
                                                >
                                                    <Pencil
                                                        size={
                                                            16
                                                        }
                                                    />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openStatusConfirmation(
                                                            employee
                                                        )
                                                    }
                                                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${employee.active
                                                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                                        }`}
                                                >
                                                    <Power
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    {employee.active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                            </div>

                                        </motion.div>
                                    )
                                )}

                            </div>
                        </>
                    )}

                </div>

            </div>

            {/* ==================================================
                ADD EMPLOYEE MODAL
            ================================================== */}

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F184B]/50 p-4 backdrop-blur-sm"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeAddModal();
                            }
                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                        >

                            {/* Header */}

                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="rounded-xl bg-[#F4EFFA] p-3 text-[#532B88]">
                                        <UserPlus
                                            size={22}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-[#2F184B]">
                                            Add Employee
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Create a new WorkPulse
                                            employee account.
                                        </p>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    disabled={formLoading}
                                    className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    handleAddEmployee
                                }
                                className="space-y-5 p-6"
                            >

                                {formError && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                        <AlertTriangle
                                            size={18}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span>
                                            {formError}
                                        </span>
                                    </div>
                                )}

                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* Employee Code */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Employee Code{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="employeeCode"
                                            value={
                                                formData.employeeCode
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="EMP001"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                formLoading
                                            }
                                        />
                                    </div>

                                    {/* Name */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Full Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter full name"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                formLoading
                                            }
                                        />
                                    </div>

                                    {/* Email */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Email{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="employee@example.com"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                formLoading
                                            }
                                        />
                                    </div>

                                    {/* Phone */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Phone
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter phone number"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                formLoading
                                            }
                                        />
                                    </div>

                                    {/* Department */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Department{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            name="department"
                                            value={
                                                formData.department
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                formLoading
                                            }
                                        >
                                            <option value="">
                                                Select department
                                            </option>

                                            {departmentOptions.map(
                                                (
                                                    department
                                                ) => (
                                                    <option
                                                        key={
                                                            department
                                                        }
                                                        value={
                                                            department
                                                        }
                                                    >
                                                        {
                                                            department
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    {/* Role */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Role{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="role"
                                            value={
                                                formData.role
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Software Developer"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                formLoading
                                            }
                                        />
                                    </div>

                                    {/* Other Department */}

                                    {formData.department ===
                                        "Other" && (
                                            <div className="sm:col-span-2">
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Department
                                                    Name{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="text"
                                                    name="otherDepartment"
                                                    value={
                                                        formData.otherDepartment
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Enter department name"
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                                    disabled={
                                                        formLoading
                                                    }
                                                />
                                            </div>
                                        )}

                                    {/* Password */}

                                    <div className="sm:col-span-2">

                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">

                                            <LockKeyhole
                                                size={17}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <input
                                                type="password"
                                                name="password"
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Minimum 8 characters"
                                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                                disabled={
                                                    formLoading
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* Buttons */}

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={
                                            closeAddModal
                                        }
                                        disabled={
                                            formLoading
                                        }
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            formLoading
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F184B] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {formLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus
                                                    size={
                                                        17
                                                    }
                                                />
                                                Add Employee
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                EDIT EMPLOYEE MODAL
            ================================================== */}

            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F184B]/50 p-4 backdrop-blur-sm"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeEditModal();
                            }
                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                        >

                            {/* Header */}

                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="rounded-xl bg-[#F4EFFA] p-3 text-[#532B88]">
                                        <Pencil
                                            size={22}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-[#2F184B]">
                                            Edit Employee
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Update employee
                                            information.
                                        </p>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={
                                        editFormLoading
                                    }
                                    className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    handleEditEmployee
                                }
                                className="space-y-5 p-6"
                            >

                                {editFormError && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                        <AlertTriangle
                                            size={18}
                                            className="mt-0.5 shrink-0"
                                        />

                                        <span>
                                            {
                                                editFormError
                                            }
                                        </span>
                                    </div>
                                )}

                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* Employee Code */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Employee Code{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="employeeCode"
                                            value={
                                                editFormData.employeeCode
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            placeholder="EMP001"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                editFormLoading
                                            }
                                        />
                                    </div>

                                    {/* Name */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Full Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                editFormData.name
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            placeholder="Enter full name"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                editFormLoading
                                            }
                                        />
                                    </div>

                                    {/* Email */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Email{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                editFormData.email
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            placeholder="employee@example.com"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                editFormLoading
                                            }
                                        />
                                    </div>

                                    {/* Phone */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Phone
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                editFormData.phone
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            placeholder="Enter phone number"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                editFormLoading
                                            }
                                        />
                                    </div>

                                    {/* Department */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Department{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            name="department"
                                            value={
                                                editFormData.department
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                editFormLoading
                                            }
                                        >
                                            <option value="">
                                                Select department
                                            </option>

                                            {departmentOptions.map(
                                                (
                                                    department
                                                ) => (
                                                    <option
                                                        key={
                                                            department
                                                        }
                                                        value={
                                                            department
                                                        }
                                                    >
                                                        {
                                                            department
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    {/* Role */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Role{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="role"
                                            value={
                                                editFormData.role
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            placeholder="Software Developer"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                            disabled={
                                                editFormLoading
                                            }
                                        />
                                    </div>

                                    {/* Other Department */}

                                    {editFormData.department ===
                                        "Other" && (
                                            <div className="sm:col-span-2">

                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Department
                                                    Name{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="text"
                                                    name="otherDepartment"
                                                    value={
                                                        editFormData.otherDepartment
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    placeholder="Enter department name"
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                                    disabled={
                                                        editFormLoading
                                                    }
                                                />

                                            </div>
                                        )}

                                    {/* Password */}

                                    <div className="sm:col-span-2">

                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            New Password
                                        </label>

                                        <div className="relative">

                                            <LockKeyhole
                                                size={17}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <input
                                                type="password"
                                                name="password"
                                                value={
                                                    editFormData.password
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                placeholder="Leave blank to keep current password"
                                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#9B72CF] focus:ring-4 focus:ring-[#9B72CF]/10"
                                                disabled={
                                                    editFormLoading
                                                }
                                            />

                                        </div>

                                        <p className="mt-2 text-xs text-gray-400">
                                            Only enter a password
                                            if you want to change
                                            the employee's current
                                            password.
                                        </p>

                                    </div>

                                </div>

                                {/* Buttons */}

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={
                                            closeEditModal
                                        }
                                        disabled={
                                            editFormLoading
                                        }
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            editFormLoading
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F184B] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {editFormLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2
                                                    size={
                                                        17
                                                    }
                                                />
                                                Save Changes
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                STATUS CONFIRMATION MODAL
            ================================================== */}

            <AnimatePresence>
                {statusEmployee && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2F184B]/50 p-4 backdrop-blur-sm"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.94,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.94,
                                y: 15,
                            }}
                            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        >

                            <div className="flex items-start gap-4">

                                <div
                                    className={`rounded-2xl p-3 ${statusEmployee.active
                                        ? "bg-red-50 text-red-500"
                                        : "bg-green-50 text-green-600"
                                        }`}
                                >
                                    {statusEmployee.active ? (
                                        <AlertTriangle
                                            size={24}
                                        />
                                    ) : (
                                        <CheckCircle2
                                            size={24}
                                        />
                                    )}
                                </div>

                                <div className="flex-1">

                                    <h2 className="text-xl font-bold text-[#2F184B]">
                                        {statusEmployee.active
                                            ? "Deactivate Employee?"
                                            : "Activate Employee?"}
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        Are you sure you want
                                        to{" "}
                                        {statusEmployee.active
                                            ? "deactivate"
                                            : "activate"}{" "}
                                        <span className="font-semibold text-gray-700">
                                            {
                                                statusEmployee.name
                                            }
                                        </span>
                                        ?
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeStatusConfirmation
                                    }
                                    disabled={
                                        statusLoading
                                    }
                                    className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={
                                        closeStatusConfirmation
                                    }
                                    disabled={
                                        statusLoading
                                    }
                                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleStatusChange
                                    }
                                    disabled={
                                        statusLoading
                                    }
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 ${statusEmployee.active
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {statusLoading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Power
                                                size={17}
                                            />

                                            {statusEmployee.active
                                                ? "Deactivate"
                                                : "Activate"}
                                        </>
                                    )}
                                </button>

                            </div>

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                TOAST
            ================================================== */}

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 30,
                            x: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 30,
                            x: 20,
                        }}
                        className="fixed bottom-5 right-5 z-[70] w-[calc(100%-2.5rem)] max-w-sm"
                    >

                        <div
                            className={`overflow-hidden rounded-2xl border bg-white shadow-2xl ${toast.type === "error"
                                ? "border-red-100"
                                : "border-green-100"
                                }`}
                        >

                            <div className="flex items-center gap-3 p-4">

                                <div
                                    className={`rounded-xl p-2 ${toast.type ===
                                        "error"
                                        ? "bg-red-50 text-red-500"
                                        : "bg-green-50 text-green-600"
                                        }`}
                                >
                                    {toast.type ===
                                        "error" ? (
                                        <AlertTriangle
                                            size={18}
                                        />
                                    ) : (
                                        <CheckCircle2
                                            size={18}
                                        />
                                    )}
                                </div>

                                <p className="flex-1 text-sm font-semibold text-gray-700">
                                    {toast.message}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setToast(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                show: false,
                                            })
                                        )
                                    }
                                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                                >
                                    <X size={16} />
                                </button>

                            </div>

                            <motion.div
                                initial={{
                                    width: "100%",
                                }}
                                animate={{
                                    width: "0%",
                                }}
                                transition={{
                                    duration: 3,
                                    ease: "linear",
                                }}
                                className={`h-1 ${toast.type ===
                                    "error"
                                    ? "bg-red-400"
                                    : "bg-[#9B72CF]"
                                    }`}
                            />

                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Employees;
