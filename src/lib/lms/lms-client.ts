// Khu học viên — BẢN DEMO chạy hoàn toàn phía client (localStorage), KHÔNG an toàn cho production.
// Khi kết nối Neon Postgres (Giai đoạn 4 đầy đủ), thay bằng API /api/auth/* + /api/courses/*
// dùng bảng users/sessions/course_enrollments/lesson_progress trong db/schema.ts, mật khẩu hash bằng argon2.

export interface DemoUser {
  email: string;
  name: string;
}

const USERS_KEY = "thien-anh-demo-users";
const SESSION_KEY = "thien-anh-demo-session";
const ENROLLMENTS_KEY = "thien-anh-demo-enrollments";
const PROGRESS_KEY = "thien-anh-demo-progress";

interface StoredUser extends DemoUser {
  password: string; // demo only — không bao giờ lưu mật khẩu thô thế này trên server thật
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

// --- Auth demo ---

export function register(name: string, email: string, password: string): { ok: boolean; error?: string } {
  const users = read<StoredUser[]>(USERS_KEY, []);
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "Email này đã đăng ký tài khoản." };
  }
  users.push({ name, email, password });
  write(USERS_KEY, users);
  write(SESSION_KEY, { email, name } satisfies DemoUser);
  return { ok: true };
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const users = read<StoredUser[]>(USERS_KEY, []);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { ok: false, error: "Email hoặc mật khẩu không đúng." };
  }
  write(SESSION_KEY, { email: user.email, name: user.name } satisfies DemoUser);
  return { ok: true };
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): DemoUser | null {
  return read<DemoUser | null>(SESSION_KEY, null);
}

// --- Ghi danh khóa học ---

interface Enrollment {
  email: string;
  courseSlug: string;
}

export function enroll(courseSlug: string) {
  const user = getCurrentUser();
  if (!user) return false;
  const enrollments = read<Enrollment[]>(ENROLLMENTS_KEY, []);
  if (!enrollments.some((e) => e.email === user.email && e.courseSlug === courseSlug)) {
    enrollments.push({ email: user.email, courseSlug });
    write(ENROLLMENTS_KEY, enrollments);
  }
  return true;
}

export function isEnrolled(courseSlug: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return read<Enrollment[]>(ENROLLMENTS_KEY, []).some(
    (e) => e.email === user.email && e.courseSlug === courseSlug
  );
}

export function getEnrolledCourseSlugs(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  return read<Enrollment[]>(ENROLLMENTS_KEY, [])
    .filter((e) => e.email === user.email)
    .map((e) => e.courseSlug);
}

// --- Tiến độ học ---

interface ProgressEntry {
  email: string;
  courseSlug: string;
  lessonSlug: string;
}

export function markLessonComplete(courseSlug: string, lessonSlug: string) {
  const user = getCurrentUser();
  if (!user) return;
  const progress = read<ProgressEntry[]>(PROGRESS_KEY, []);
  if (!progress.some((p) => p.email === user.email && p.courseSlug === courseSlug && p.lessonSlug === lessonSlug)) {
    progress.push({ email: user.email, courseSlug, lessonSlug });
    write(PROGRESS_KEY, progress);
  }
}

export function isLessonComplete(courseSlug: string, lessonSlug: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return read<ProgressEntry[]>(PROGRESS_KEY, []).some(
    (p) => p.email === user.email && p.courseSlug === courseSlug && p.lessonSlug === lessonSlug
  );
}

export function getCompletedLessons(courseSlug: string): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  return read<ProgressEntry[]>(PROGRESS_KEY, [])
    .filter((p) => p.email === user.email && p.courseSlug === courseSlug)
    .map((p) => p.lessonSlug);
}
