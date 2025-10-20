import { supabase } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  display_name: string;
  password: string;
}

export interface UpdateUserInput {
  display_name?: string;
  password?: string;
}

/**
 * ユーザーリポジトリ
 * ユーザー情報のCRUD操作を提供
 */
export class UserRepository {
  /**
   * ユーザー名でユーザーを取得
   */
  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, display_name, created_at, updated_at")
      .eq("username", username)
      .single();

    if (error || !data) {
      return null;
    }

    return data as any;
  }

  /**
   * IDでユーザーを取得
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, display_name, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as any;
  }

  /**
   * すべてのユーザーを取得
   */
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, display_name, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as any;
  }

  /**
   * ユーザーを作成
   */
  async create(input: CreateUserInput): Promise<User | null> {
    // パスワードハッシュ化
    const password_hash = await bcrypt.hash(input.password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: input.username,
        display_name: input.display_name,
        password_hash,
      } as any)
      .select("id, username, display_name, created_at, updated_at")
      .single();

    if (error || !data) {
      console.error("Failed to create user:", error);
      return null;
    }

    return data as any;
  }

  /**
   * ユーザー情報を更新
   */
  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData: any = {};

    if (input.display_name) {
      updateData.display_name = input.display_name;
    }

    if (input.password) {
      updateData.password_hash = await bcrypt.hash(input.password, 10);
    }

    const { data, error } = await (supabase as any)
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, username, display_name, created_at, updated_at")
      .single();

    if (error || !data) {
      console.error("Failed to update user:", error);
      return null;
    }

    return data as any;
  }

  /**
   * パスワードを検証
   */
  async verifyPassword(
    username: string,
    password: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("users")
      .select("password_hash")
      .eq("username", username)
      .single();

    if (error || !data) {
      return false;
    }

    const userData = data as any;
    return await bcrypt.compare(password, userData.password_hash);
  }

  /**
   * パスワードを変更
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    // 現在のパスワード検証
    const { data: user, error } = await supabase
      .from("users")
      .select("username, password_hash")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return false;
    }

    const userData = user as any;
    const isValid = await bcrypt.compare(
      currentPassword,
      userData.password_hash
    );

    if (!isValid) {
      return false;
    }

    // 新しいパスワードでハッシュ化して更新
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await (supabase as any)
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", userId);

    return !updateError;
  }
}

// シングルトンインスタンス
export const userRepository = new UserRepository();
