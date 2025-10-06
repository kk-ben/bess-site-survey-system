#!/usr/bin/env node

/**
 * BESS Site Survey System - API経由デプロイスクリプト
 * Supabase Management APIを使用してテストデータを投入
 */

const https = require('https');
const http = require('http');

// Supabase設定
const SUPABASE_URL = 'https://kcohexmvbccxixyfvjyw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE';

// VPS設定
const VPS_HOST = '153.121.61.164';
const VPS_PORT = 3000;

console.log('🚀 BESS Site Survey System - API経由デプロイ開始\n');

// 1. VPS APIヘルスチェック
function checkVPSHealth() {
  return new Promise((resolve, reject) => {
    console.log('📡 VPS APIヘルスチェック中...');
    
    const options = {
      hostname: VPS_HOST,
      port: VPS_PORT,
      path: '/api/v2',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ VPS API正常稼働中');
          console.log(`   レスポンス: ${data}\n`);
          resolve(true);
        } else {
          console.log(`⚠️  VPS API応答異常 (Status: ${res.statusCode})\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ VPS API接続エラー: ${error.message}\n`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('❌ VPS API接続タイムアウト\n');
      resolve(false);
    });

    req.end();
  });
}

// 2. Supabaseにテストユーザーを作成
function createTestUsers() {
  return new Promise((resolve, reject) => {
    console.log('👤 テストユーザー作成中...');
    
    const users = [
      {
        email: 'admin@bess.com',
        password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        full_name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'user@bess.com',
        password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        full_name: 'Test User',
        role: 'user'
      }
    ];

    const postData = JSON.stringify(users);
    
    const options = {
      hostname: 'kcohexmvbccxixyfvjyw.supabase.co',
      path: '/rest/v1/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ テストユーザー作成完了');
          console.log(`   作成数: ${users.length}件\n`);
          resolve(true);
        } else {
          console.log(`⚠️  ユーザー作成エラー (Status: ${res.statusCode})`);
          console.log(`   レスポンス: ${data}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Supabase接続エラー: ${error.message}\n`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// 3. Supabaseにテストサイトを作成
function createTestSites() {
  return new Promise((resolve, reject) => {
    console.log('🏢 テストサイト作成中...');
    
    const sites = [
      {
        site_code: 'STB2025-000001',
        name: '東京テストサイト',
        address: '東京都千代田区丸の内1-1-1',
        lat: 35.6762,
        lon: 139.6503,
        area_m2: 10000,
        status: 'draft'
      },
      {
        site_code: 'STB2025-000002',
        name: '大阪テストサイト',
        address: '大阪府大阪市北区梅田1-1-1',
        lat: 34.6937,
        lon: 135.5023,
        area_m2: 15000,
        status: 'under_review'
      },
      {
        site_code: 'STB2025-000003',
        name: '福岡テストサイト',
        address: '福岡県福岡市博多区博多駅前1-1-1',
        lat: 33.5904,
        lon: 130.4017,
        area_m2: 8500,
        status: 'approved'
      }
    ];

    const postData = JSON.stringify(sites);
    
    const options = {
      hostname: 'kcohexmvbccxixyfvjyw.supabase.co',
      path: '/rest/v1/sites',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates,return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ テストサイト作成完了');
          console.log(`   作成数: ${sites.length}件\n`);
          resolve(true);
        } else {
          console.log(`⚠️  サイト作成エラー (Status: ${res.statusCode})`);
          console.log(`   レスポンス: ${data}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Supabase接続エラー: ${error.message}\n`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// メイン実行
async function main() {
  console.log('================================================\n');
  
  // VPSヘルスチェック
  const vpsHealthy = await checkVPSHealth();
  
  // Supabaseにデータ投入
  if (SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_KEY_HERE') {
    console.log('⚠️  SUPABASE_SERVICE_KEYが設定されていません');
    console.log('   環境変数を設定してください:\n');
    console.log('   export SUPABASE_SERVICE_KEY="your-service-key"\n');
    console.log('================================================\n');
    process.exit(1);
  }
  
  const usersCreated = await createTestUsers();
  const sitesCreated = await createTestSites();
  
  console.log('================================================');
  console.log('🎉 デプロイ完了！\n');
  console.log('結果:');
  console.log(`  VPS API: ${vpsHealthy ? '✅ 正常' : '❌ 異常'}`);
  console.log(`  ユーザー: ${usersCreated ? '✅ 作成完了' : '⚠️  エラー'}`);
  console.log(`  サイト: ${sitesCreated ? '✅ 作成完了' : '⚠️  エラー'}`);
  console.log('\n次のステップ:');
  console.log('  1. Vercelにアクセス');
  console.log('     https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login');
  console.log('  2. ログイン');
  console.log('     Email: admin@bess.com');
  console.log('     Password: password123');
  console.log('================================================\n');
}

main().catch(console.error);
