import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ClipboardCheck,
  Info,
  AlertCircle,
  Sparkles,
  Clock3,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

function Notifications() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Get logged-in employee from localStorage
  const currentEmployee = JSON.parse(
    localStorage.getItem("workpulse_current_employee") || "null"
  );

  const currentEmployeeCode =
    currentEmployee?.employeeCode || "";

  // Only show notifications belonging to logged-in employee
  const myNotifications = notifications.filter(
    (notification) =>
      notification.employeeCode === currentEmployeeCode
  );

  const unreadNotifications = myNotifications.filter(
    (notification) => !notification.read
  );

  const readNotifications = myNotifications.filter(
    (notification) => notification.read
  );

  // --------------------------------------------------
  // Notification Icon
  // --------------------------------------------------

  const getNotificationIcon = (type) => {
    switch (type) {
      case "EOD_SUBMITTED":
        return <ClipboardCheck size={20} />;

      case "EOD_UPDATED":
        return <Sparkles size={20} />;

      case "REMINDER":
        return <AlertCircle size={20} />;

      default:
        return <Info size={20} />;
    }
  };

  // --------------------------------------------------
  // Notification Label
  // --------------------------------------------------

  const getNotificationLabel = (type) => {
    switch (type) {
      case "EOD_SUBMITTED":
        return "EOD Submitted";

      case "EOD_UPDATED":
        return "EOD Updated";

      case "REMINDER":
        return "Reminder";

      default:
        return "WorkPulse Update";
    }
  };

  // --------------------------------------------------
  // Date Formatting
  // --------------------------------------------------

  const formatNotificationDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4EFFA] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* ================================================
          AMBIENT BACKGROUND
      ================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#C8B1E4]/30 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#9B72CF]/10 blur-3xl"
        />

      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* ================================================
            HEADER
        ================================================ */}

        <motion.header
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-8"
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#532B88] text-white shadow-lg shadow-[#532B88]/20">
                  <Bell size={18} />
                </div>

                <span className="text-sm font-semibold text-[#806F8F]">
                  Stay Updated
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#2F184B] sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#69577A] sm:text-base">
                Keep track of your EOD submissions, updates,
                reminders, and important WorkPulse activity.
              </p>

            </div>

            {unreadNotifications.length > 0 && (
              <motion.button
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                type="button"
                onClick={() =>
                  markAllAsRead(currentEmployeeCode)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#532B88] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#532B88]/20 transition hover:bg-[#2F184B] sm:w-auto"
              >
                <CheckCheck size={18} />
                Mark All as Read
              </motion.button>
            )}

          </div>

        </motion.header>

        {/* ================================================
            SUMMARY CARDS
        ================================================ */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          {/* Total */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-2xl border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_35px_rgba(47,24,75,0.06)] backdrop-blur-xl"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                <Bell size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                  Total
                </p>

                <motion.p
                  key={myNotifications.length}
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  className="mt-1 text-2xl font-bold text-[#2F184B]"
                >
                  {myNotifications.length}
                </motion.p>
              </div>

            </div>

          </motion.div>

          {/* Unread */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="rounded-2xl border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_35px_rgba(47,24,75,0.06)] backdrop-blur-xl"
          >

            <div className="flex items-center gap-3">

              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#532B88]/10 text-[#532B88]">

                <AlertCircle size={21} />

                {unreadNotifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#9B72CF]" />
                )}

              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                  Unread
                </p>

                <motion.p
                  key={unreadNotifications.length}
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  className="mt-1 text-2xl font-bold text-[#532B88]"
                >
                  {unreadNotifications.length}
                </motion.p>
              </div>

            </div>

          </motion.div>

          {/* Read */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="rounded-2xl border border-[#C8B1E4]/40 bg-white/75 p-5 shadow-[0_12px_35px_rgba(47,24,75,0.06)] backdrop-blur-xl"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#9B72CF]">
                <CheckCheck size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#806F8F]">
                  Read
                </p>

                <motion.p
                  key={readNotifications.length}
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  className="mt-1 text-2xl font-bold text-[#2F184B]"
                >
                  {readNotifications.length}
                </motion.p>
              </div>

            </div>

          </motion.div>

        </div>

        {/* ================================================
            NOTIFICATION PANEL
        ================================================ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="overflow-hidden rounded-[24px] border border-[#C8B1E4]/40 bg-white/75 shadow-[0_12px_40px_rgba(47,24,75,0.07)] backdrop-blur-xl"
        >

          {/* Panel Header */}

          <div className="border-b border-[#C8B1E4]/30 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EFFA] text-[#532B88]">
                <Bell size={19} />
              </div>

              <div>

                <h2 className="text-lg font-bold text-[#2F184B]">
                  Your Notifications
                </h2>

                <p className="mt-1 text-sm text-[#806F8F]">
                  Notifications related to your employee activity.
                </p>

              </div>

            </div>

          </div>

          {/* ================================================
              EMPTY STATE
          ================================================ */}

          {myNotifications.length === 0 ? (

            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">

              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F4EFFA] text-[#9B72CF]"
              >
                <Bell size={34} />
              </motion.div>

              <h3 className="mt-5 text-lg font-bold text-[#2F184B]">
                No notifications yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#806F8F]">
                Your EOD submissions and other important
                WorkPulse updates will appear here.
              </p>

            </div>

          ) : (

            /* ================================================
               NOTIFICATION LIST
            ================================================ */

            <div className="p-4 sm:p-6">

              <div className="space-y-3">

                <AnimatePresence mode="popLayout">

                  {myNotifications.map(
                    (notification, index) => {

                      const isUnread =
                        !notification.read;

                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{
                            opacity: 0,
                            y: 12,
                            scale: 0.98,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            x: 30,
                            scale: 0.96,
                          }}
                          transition={{
                            delay: index * 0.04,
                            duration: 0.3,
                          }}
                          className={`group relative overflow-hidden rounded-2xl border p-4 transition sm:p-5 ${
                            isUnread
                              ? "border-[#C8B1E4]/70 bg-[#F4EFFA]/80 shadow-sm"
                              : "border-[#C8B1E4]/30 bg-white/60"
                          }`}
                        >

                          {/* Unread Indicator */}

                          {isUnread && (
                            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#532B88]" />
                          )}

                          <div className="flex gap-4">

                            {/* Icon */}

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                isUnread
                                  ? "bg-[#532B88] text-white shadow-md shadow-[#532B88]/20"
                                  : "bg-[#F4EFFA] text-[#9B72CF]"
                              }`}
                            >
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            {/* Content */}

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                <div className="min-w-0">

                                  {/* Title */}

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="font-bold text-[#2F184B]">
                                      {notification.title}
                                    </h3>

                                    {isUnread && (
                                      <span className="rounded-full bg-[#532B88] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                        New
                                      </span>
                                    )}

                                  </div>

                                  {/* Type */}

                                  <div className="mt-2 flex flex-wrap items-center gap-2">

                                    <span className="rounded-full bg-[#C8B1E4]/30 px-2.5 py-1 text-[10px] font-semibold text-[#532B88]">
                                      {getNotificationLabel(
                                        notification.type
                                      )}
                                    </span>

                                    <span className="flex items-center gap-1 text-[11px] text-[#9B72CF]">
                                      <Clock3
                                        size={12}
                                      />

                                      {formatNotificationDate(
                                        notification.createdAt
                                      )}
                                    </span>

                                  </div>

                                  {/* Message */}

                                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#69577A]">
                                    {notification.message}
                                  </p>

                                </div>

                                {/* Actions */}

                                <div className="flex shrink-0 items-center gap-2">

                                  {!notification.read && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        markAsRead(
                                          notification.id
                                        )
                                      }
                                      className="flex items-center gap-1.5 rounded-lg border border-[#C8B1E4]/50 bg-white px-3 py-2 text-xs font-semibold text-[#532B88] transition hover:bg-[#F4EFFA]"
                                    >
                                      <Check
                                        size={15}
                                      />
                                      Mark Read
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteNotification(
                                        notification.id
                                      )
                                    }
                                    className="rounded-lg border border-transparent p-2 text-[#9B72CF] transition hover:border-[#C8B1E4]/40 hover:bg-[#F4EFFA] hover:text-[#532B88]"
                                    aria-label="Delete notification"
                                  >
                                    <Trash2
                                      size={17}
                                    />
                                  </button>

                                </div>

                              </div>

                            </div>

                          </div>

                        </motion.div>
                      );
                    }
                  )}

                </AnimatePresence>

              </div>

            </div>
          )}

        </motion.section>

        {/* ================================================
            FOOTER
        ================================================ */}

        {myNotifications.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
            }}
            className="mt-5 flex items-center justify-center gap-2 text-xs text-[#9B72CF]"
          >
            <Sparkles size={13} />
            <span>
              WorkPulse keeps your daily activity organized.
            </span>
          </motion.div>
        )}

      </div>
    </main>
  );
}

export default Notifications;
