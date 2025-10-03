import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 初期データを投入中...');

    // 管理者ユーザーの作成
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (user_id, name, email, password_hash, role)
      VALUES (
        gen_random_uuid(),
        'システム管理者',
        'admin@example.com',
        $1,
        'admin'
      )
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✅ 管理者ユーザーを作成しました');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  本番環境では必ずパスワードを変更してください！');

    // 一般ユーザーの作成
    const userPassword = await bcrypt.hash('user123', 10);
    
    await client.query(`
      INSERT INTO users (user_id, name, email, password_hash, role)
      VALUES (
        gen_random_uuid(),
        '一般ユーザー',
        'user@example.com',
        $1,
        'user'
      )
      ON CONFLICT (email) DO NOTHING
    `, [userPassword]);

    console.log('✅ 一般ユーザーを作成しました');
    console.log('   Email: user@example.com');
    console.log('   Password: user123');

    // デフォルト評価パラメータの設定
    await client.query(`
      INSERT INTO config_parameters (parameter_key, parameter_value, description)
      VALUES
        ('grid_weight', '0.35', '系統連系評価の重み'),
        ('setback_weight', '0.30', 'セットバック評価の重み'),
        ('road_weight', '0.25', '道路アクセス評価の重み'),
        ('pole_weight', '0.10', '電柱近接性評価の重み'),
        ('grid_max_distance', '1000', '系統連系最大距離（m）'),
        ('setback_min_distance', '50', 'セットバック最小距離（m）'),
        ('pole_max_distance', '100', '電柱最大距離（m）')
      ON CONFLICT (parameter_key) DO NOTHING
    `);

    console.log('✅ デフォルト評価パラメータを設定しました');

    console.log('');
    console.log('🎉 初期データの投入が完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
