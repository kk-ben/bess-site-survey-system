-- ============================================================================
-- 古いv1.0スキーマを削除してv2.0に移行
-- ============================================================================

-- ⚠️ 警告: このSQLは既存のデータをすべて削除します！
-- 本番環境では実行前に必ずバックアップを取ってください。

-- 既存のテーブルを削除（存在する場合のみ）
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS automation_sources CASCADE;
DROP TABLE IF EXISTS economics CASCADE;
DROP TABLE IF EXISTS access_physical CASCADE;
DROP TABLE IF EXISTS land_regulatory CASCADE;
DROP TABLE IF EXISTS geo_risk CASCADE;
DROP TABLE IF EXISTS grid_info CASCADE;
DROP TABLE IF EXISTS sites CASCADE;

-- usersテーブルは残す（既存のユーザーデータを保持）
-- DROP TABLE IF EXISTS users CASCADE;

-- 既存の関数を削除
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- 確認メッセージ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 古いテーブルを削除しました';
    RAISE NOTICE '📋 次のステップ: v2.0スキーマSQLを実行してください';
    RAISE NOTICE '   ファイル: bess-site-survey-system/database/migrations/002_normalized_schema.sql';
END $$;
