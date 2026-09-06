// src/pages/Employees.jsx

import { motion } from "framer-motion";
import {
    Users,
    UserRound,
    Building2,
    Search,
    CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useEmployees } from "../context/EmployeeContext";

function Employees() {
    const { employees } = useEmployees();

    const [searchTerm, setSearchTerm] = useState("");

    // Filter employees
    const filteredEmployees = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return employees;
        }

        return employees.filter(
            (employee) =>
                employee.name
                    ?.toLowerCase()
                    .includes(search) ||
                employee.employeeCode
                    ?.toLowerCase()
                    .includes(search) ||
                employee.department
                    ?.toLowerCase()
                    .includes(search)
        );
    }, [employees, searchTerm]);

    const activeEmployees = employees.filter(
        (employee) => employee.status === "Active"
    ).length;

    const hasEmployees = employees.length > 0;
    const hasSearchResults = filteredEmployees.length > 0;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] p-4 sm:p-6 lg:p-8">
            {/* Ambient Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 25, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C8B1E4]/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -25, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#9B72CF]/20 blur-3xl"
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-[#806F8F]">
                        <Users size={17} />
                        Organization
                    </div>

                    <h1 className="mt-1 text-3xl font-bold text-[#2F184B] sm:text-4xl">
                        Employees
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-[#806F8F]">
                        View the employees registered in your
                        organization and their current status.
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#806F8F]">
                                    Total Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-[#2F184B]">
                                    {employees.length}
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8B1E4]/50 text-[#532B88]">
                                <Users size={23} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#806F8F]">
                                    Active Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-[#2F184B]">
                                    {activeEmployees}
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8B1E4]/50 text-[#532B88]">
                                <CheckCircle2 size={23} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Employee Directory */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-3xl border border-white/70 bg-white/65 shadow-[0_20px_50px_rgba(47,24,75,0.08)] backdrop-blur-xl"
                >
                    {/* Section Header */}
                    <div className="border-b border-[#C8B1E4]/40 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#2F184B]">
                                    Employee Directory
                                </h2>

                                <p className="mt-1 text-sm text-[#806F8F]">
                                    All registered employees
                                </p>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-80">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B72CF]"
                                />

                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="h-11 w-full rounded-xl border border-[#C8B1E4]/70 bg-white/70 pl-10 pr-4 text-sm text-[#2F184B] outline-none transition placeholder:text-[#9B72CF]/70 focus:border-[#532B88] focus:ring-2 focus:ring-[#C8B1E4]/40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#C8B1E4]/40 bg-[#F4EFFA]/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#806F8F]">
                                        Employee
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#806F8F]">
                                        Employee Code
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#806F8F]">
                                        Department
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#806F8F]">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {hasSearchResults ? (
                                    filteredEmployees.map(
                                        (employee, index) => (
                                            <motion.tr
                                                key={employee.employeeCode}
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                transition={{
                                                    delay:
                                                        index * 0.05,
                                                }}
                                                className="border-b border-[#C8B1E4]/30 transition hover:bg-[#F4EFFA]/60"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#532B88] font-bold text-white">
                                                            {employee.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-[#2F184B]">
                                                                {
                                                                    employee.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-[#806F8F]">
                                                                Employee
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-lg bg-[#C8B1E4]/35 px-3 py-1.5 text-sm font-semibold text-[#532B88]">
                                                        {
                                                            employee.employeeCode
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-[#69577A]">
                                                        <Building2
                                                            size={16}
                                                            className="text-[#9B72CF]"
                                                        />

                                                        {
                                                            employee.department
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#C8B1E4]/35 px-3 py-1.5 text-xs font-semibold text-[#532B88]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#532B88]" />

                                                        {
                                                            employee.status
                                                        }
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-14 text-center"
                                        >
                                            <UserRound
                                                size={38}
                                                className="mx-auto text-[#C8B1E4]"
                                            />

                                            <p className="mt-3 font-semibold text-[#2F184B]">
                                                {hasEmployees
                                                    ? "No employees found"
                                                    : "No employees registered yet"}
                                            </p>

                                            <p className="mt-1 text-sm text-[#806F8F]">
                                                {hasEmployees
                                                    ? "Try a different search term."
                                                    : "Employees added by the administrator will appear here."}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="space-y-3 p-4 md:hidden">
                        {hasSearchResults ? (
                            filteredEmployees.map(
                                (employee, index) => (
                                    <motion.div
                                        key={employee.employeeCode}
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            delay: index * 0.05,
                                        }}
                                        className="rounded-2xl border border-[#C8B1E4]/50 bg-white/60 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#532B88] font-bold text-white">
                                                {employee.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-semibold text-[#2F184B]">
                                                            {
                                                                employee.name
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-xs font-medium text-[#532B88]">
                                                            {
                                                                employee.employeeCode
                                                            }
                                                        </p>
                                                    </div>

                                                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#C8B1E4]/35 px-2.5 py-1 text-[11px] font-semibold text-[#532B88]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#532B88]" />

                                                        {
                                                            employee.status
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center gap-2 text-xs text-[#806F8F]">
                                                    <Building2
                                                        size={14}
                                                        className="text-[#9B72CF]"
                                                    />

                                                    {
                                                        employee.department
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            )
                        ) : (
                            <div className="py-10 text-center">
                                <UserRound
                                    size={35}
                                    className="mx-auto text-[#C8B1E4]"
                                />

                                <p className="mt-3 font-semibold text-[#2F184B]">
                                    {hasEmployees
                                        ? "No employees found"
                                        : "No employees registered yet"}
                                </p>

                                <p className="mt-1 text-sm text-[#806F8F]">
                                    {hasEmployees
                                        ? "Try a different search term."
                                        : "Employees added by the administrator will appear here."}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.section>
            </div>
        </main>
    );
}

export default Employees;