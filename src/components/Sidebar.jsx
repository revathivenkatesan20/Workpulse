import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

import {
    LayoutDashboard,
    ClipboardList,
    ClipboardCheck,
    BarChart3,
    Bell,
    Users,
    Settings,
    LogOut,
    X,
    Activity,
    Sparkles,
} from "lucide-react";

/* =========================================================
   MENU ITEMS
========================================================= */

const menuItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
    },
    {
        name: "My EOD",
        icon: ClipboardList,
        path: "/eod",
    },
    {
        name: "Admin EOD",
        icon: ClipboardCheck,
        path: "/admin-eod",
        adminOnly: true,
    },
    {
        name: "Analytics",
        icon: BarChart3,
        path: "/analytics",
    },
    {
        name: "Notifications",
        icon: Bell,
        path: "/notifications",
    },
    {
        name: "Employees",
        icon: Users,
        path: "/employees",
        adminOnly: true,
    },
    {
        name: "Settings",
        icon: Settings,
        path: "/settings",
    },
];

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ isOpen, setIsOpen }) {
    const navigate = useNavigate();

    const { getUnreadCount } =
        useNotifications();

    /* =====================================================
       GET LOGGED-IN EMPLOYEE
    ===================================================== */

    const currentEmployee = (() => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    "workpulse_current_employee"
                ) || "null"
            );
        } catch (error) {
            return null;
        }
    })();

    /* =====================================================
       CURRENT EMPLOYEE CODE
    ===================================================== */

    const currentEmployeeCode =
        currentEmployee?.employeeCode || "";

    /* =====================================================
       ACCOUNT ROLE
    ===================================================== */

    const accountRole = String(
        currentEmployee?.accountRole || "EMPLOYEE"
    ).toUpperCase();

    const isAdmin =
        accountRole === "ADMIN";

    /* =====================================================
       FILTER MENU BASED ON ROLE
    ===================================================== */

    const visibleMenuItems =
        menuItems.filter((item) => {
            if (item.adminOnly && !isAdmin) {
                return false;
            }

            return true;
        });

    /* =====================================================
       UNREAD NOTIFICATION COUNT
    ===================================================== */

    const unreadCount =
        getUnreadCount(
            currentEmployeeCode
        );

    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {
        // Clear authentication/session data
        localStorage.removeItem("workpulse_token");
        localStorage.removeItem("workpulse_current_employee");
        localStorage.removeItem("workpulse_current_employee_code");
        localStorage.removeItem("workpulse_remember_me");

        // Close sidebar
        setIsOpen(false);

        // Go to login and replace browser history
        navigate("/login", {
            replace: true,
        });
    };



    return (
        <>
            {/* =============================================
                MOBILE / TABLET OVERLAY
            ============================================== */}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        onClick={() =>
                            setIsOpen(false)
                        }
                        className="
                            fixed inset-0 z-40
                            bg-[#2F184B]/30
                            backdrop-blur-sm
                            lg:hidden
                        "
                    />
                )}
            </AnimatePresence>

            {/* =============================================
                SIDEBAR
            ============================================== */}

            <motion.aside
                initial={false}
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex h-screen w-64
                    flex-col
                    border-r border-[#C8B1E4]/50
                    bg-[#F4EFFA]/95
                    text-[#2F184B]
                    shadow-2xl shadow-[#2F184B]/10
                    backdrop-blur-2xl

                    transform
                    transition-transform
                    duration-300
                    ease-in-out

                    ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >

                {/* =========================================
                    BRAND
                ========================================== */}

                <div
                    className="
                        relative
                        flex h-20
                        shrink-0
                        items-center
                        justify-between
                        border-b border-[#C8B1E4]/40
                        px-4 sm:px-5
                        overflow-hidden
                    "
                >

                    {/* Brand ambient glow */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -left-10
                            -top-12
                            h-28
                            w-28
                            rounded-full
                            bg-[#9B72CF]/20
                            blur-2xl
                        "
                    />

                    <div className="relative flex items-center gap-3">

                        {/* WorkPulse icon */}

                        <div
                            className="
                                flex h-11 w-11
                                shrink-0
                                items-center justify-center
                                rounded-2xl
                                bg-[#532B88]
                                text-white
                                shadow-lg
                                shadow-[#532B88]/20
                            "
                        >
                            <Activity
                                size={22}
                                strokeWidth={2}
                            />
                        </div>

                        {/* Brand text */}

                        <div className="min-w-0">

                            <h1
                                className="
                                    whitespace-nowrap
                                    text-xl
                                    font-bold
                                    tracking-tight
                                    text-[#2F184B]
                                "
                            >
                                WorkPulse
                            </h1>

                            <p
                                className="
                                    whitespace-nowrap
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-[0.16em]
                                    text-[#9B72CF]
                                "
                            >
                                EOD & Analytics
                            </p>

                        </div>
                    </div>

                    {/* Mobile Close */}

                    <button
                        type="button"
                        onClick={() =>
                            setIsOpen(false)
                        }
                        className="
                            relative
                            ml-2
                            rounded-xl
                            p-2
                            text-[#806F8F]
                            transition
                            hover:bg-white/70
                            hover:text-[#532B88]
                            lg:hidden
                        "
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>

                </div>

                {/* =========================================
                    NAVIGATION
                ========================================== */}

                <nav
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        px-3
                        py-5
                        sm:px-4
                        sm:py-6
                    "
                >

                    <p
                        className="
                            mb-3
                            px-3
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-[#9B72CF]
                        "
                    >
                        Workspace
                    </p>

                    <div className="space-y-1.5">

                        {visibleMenuItems.map(
                            (item, index) => {

                                const Icon =
                                    item.icon;

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        onClick={() =>
                                            setIsOpen(false)
                                        }
                                        className="block"
                                    >
                                        {({
                                            isActive,
                                        }) => (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    x: -10,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    delay:
                                                        index *
                                                        0.04,
                                                    duration:
                                                        0.2,
                                                }}
                                                whileHover={{
                                                    x: 3,
                                                }}
                                                className={`
                                                    group
                                                    relative
                                                    flex w-full
                                                    items-center
                                                    gap-3
                                                    rounded-2xl
                                                    px-3.5
                                                    py-3
                                                    sm:px-4
                                                    transition-all
                                                    duration-200

                                                    ${isActive
                                                        ? "bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20"
                                                        : "text-[#69577A] hover:bg-white/75 hover:text-[#532B88]"
                                                    }
                                                `}
                                            >

                                                {/* Active indicator */}

                                                {isActive && (
                                                    <motion.span
                                                        layoutId="sidebar-active"
                                                        className="
                                                            absolute
                                                            left-0
                                                            h-7
                                                            w-1
                                                            rounded-r-full
                                                            bg-[#C8B1E4]
                                                        "
                                                    />
                                                )}

                                                {/* Icon */}

                                                <div
                                                    className={`
                                                        flex h-9 w-9
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        transition-all
                                                        duration-200

                                                        ${isActive
                                                            ? "bg-white/15 text-white"
                                                            : "bg-[#F4EFFA] text-[#9B72CF] group-hover:bg-[#C8B1E4]/30 group-hover:text-[#532B88]"
                                                        }
                                                    `}
                                                >
                                                    <Icon
                                                        size={19}
                                                        strokeWidth={1.9}
                                                    />
                                                </div>

                                                {/* Menu Name */}

                                                <span
                                                    className="
                                                        min-w-0
                                                        truncate
                                                        text-sm
                                                        font-semibold
                                                    "
                                                >
                                                    {item.name}
                                                </span>

                                                {/* Notification Badge */}

                                                {item.name ===
                                                    "Notifications" &&
                                                    unreadCount >
                                                    0 && (
                                                        <motion.span
                                                            initial={{
                                                                scale: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                opacity: 1,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 500,
                                                                damping: 25,
                                                            }}
                                                            className={`
                                                                ml-auto
                                                                flex
                                                                h-5
                                                                min-w-5
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                px-1.5
                                                                text-[10px]
                                                                font-bold

                                                                ${isActive
                                                                    ? "bg-white text-[#532B88]"
                                                                    : "bg-[#9B72CF] text-white"
                                                                }
                                                            `}
                                                        >
                                                            {unreadCount >
                                                                99
                                                                ? "99+"
                                                                : unreadCount}
                                                        </motion.span>
                                                    )}

                                            </motion.div>
                                        )}
                                    </NavLink>
                                );
                            }
                        )}

                    </div>
                </nav>

                {/* =========================================
                    EMPLOYEE PROFILE
                ========================================== */}

                {currentEmployee && (
                    <div
                        className="
                            mx-3
                            mb-3
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[#C8B1E4]/50
                            bg-white/60
                            p-3
                            shadow-sm
                            backdrop-blur-xl
                            sm:mx-4
                        "
                    >

                        <div className="flex items-center gap-3">

                            {/* Avatar */}

                            <div
                                className="
                                    relative
                                    flex h-10 w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#532B88]
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-md
                                    shadow-[#532B88]/20
                                "
                            >
                                {currentEmployee.name
                                    ?.charAt(0)
                                    .toUpperCase()}

                                {/* Online indicator */}

                                <span
                                    className="
                                        absolute
                                        bottom-0
                                        right-0
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        border-2
                                        border-white
                                        bg-[#9B72CF]
                                    "
                                />
                            </div>

                            {/* Employee details */}

                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-bold
                                        text-[#2F184B]
                                    "
                                >
                                    {currentEmployee.name}
                                </p>

                                <p
                                    className="
                                        truncate
                                        text-[11px]
                                        font-medium
                                        text-[#9B72CF]
                                    "
                                >
                                    {currentEmployee.employeeCode}
                                </p>

                            </div>

                            <Sparkles
                                size={15}
                                className="
                                    shrink-0
                                    text-[#C8B1E4]
                                "
                            />

                        </div>
                    </div>
                )}

                {/* =========================================
                    LOGOUT
                ========================================== */}

                <div
                    className="
                        shrink-0
                        border-t border-[#C8B1E4]/40
                        p-3
                        sm:p-4
                    "
                >

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            group
                            flex w-full
                            items-center
                            gap-3
                            rounded-2xl
                            px-3.5
                            py-3
                            text-[#69577A]
                            transition-all
                            duration-200
                            hover:bg-white/75
                            hover:text-[#532B88]
                            sm:px-4
                        "
                    >

                        <div
                            className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-xl
                                bg-[#F4EFFA]
                                transition-all
                                duration-200
                                group-hover:bg-[#C8B1E4]/30
                            "
                        >
                            <LogOut
                                size={19}
                                className="
                                    shrink-0
                                    transition-transform
                                    duration-200
                                    group-hover:-translate-x-0.5
                                "
                            />
                        </div>

                        <span className="text-sm font-semibold">
                            Logout
                        </span>

                    </button>
                </div>

            </motion.aside>
        </>
    );
}

export default Sidebar;
