/**
 * Googleマップナビゲーション用ユーティリティ
 */

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

/**
 * Googleマップでナビゲーションを開く
 * @param destination 目的地の座標
 */
export function openGoogleMapsNavigation(destination: Location): void {
  const { latitude, longitude } = destination;
  
  // モバイルデバイスの判定
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // モバイルの場合、Googleマップアプリを開く
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.location.href = url;
  } else {
    // デスクトップの場合、新しいタブで開く
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(url, '_blank');
  }
}

/**
 * Googleマップで位置を表示
 * @param location 表示する位置の座標
 */
export function openGoogleMapsLocation(location: Location): void {
  const { latitude, longitude, name } = location;
  
  // モバイルデバイスの判定
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  const query = name ? encodeURIComponent(name) : `${latitude},${longitude}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

/**
 * 現在地からの距離を計算（Haversine formula）
 * @param from 開始地点
 * @param to 終了地点
 * @returns 距離（km）
 */
export function calculateDistance(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // 小数点第1位まで
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 現在地を取得
 * @returns Promise<GeolocationPosition>
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

/**
 * 位置情報の権限を確認
 * @returns Promise<PermissionState>
 */
export async function checkGeolocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'prompt';
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch (error) {
    return 'prompt';
  }
}

/**
 * 距離を人間が読みやすい形式にフォーマット
 * @param distanceKm 距離（km）
 * @returns フォーマットされた文字列
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}
