import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SiteService } from '@/services/site.service';
import { Site, CreateSiteData } from '@/types/site';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface SiteFormProps {
  site?: Site;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SiteForm: React.FC<SiteFormProps> = ({ site, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateSiteData>({
    siteName: site?.siteName || '',
    address: site?.address || '',
    latitude: site?.latitude || 0,
    longitude: site?.longitude || 0,
    areaSqm: site?.areaSqm || 0,
    landUse: site?.landUse || '',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSiteData) => SiteService.createSite(data),
    onSuccess: () => {
      toast.success('候補地を登録しました');
      onSuccess();
    },
    onError: () => {
      toast.error('登録に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateSiteData) => SiteService.updateSite(site!.siteId, data),
    onSuccess: () => {
      toast.success('候補地を更新しました');
      onSuccess();
    },
    onError: () => {
      toast.error('更新に失敗しました');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (site) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">サイト名</label>
        <input
          type="text"
          value={formData.siteName}
          onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
          className="input"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="label">住所</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="input"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">緯度</label>
          <input
            type="number"
            step="0.000001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
            className="input"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label">経度</label>
          <input
            type="number"
            step="0.000001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
            className="input"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="label">面積（㎡）</label>
        <input
          type="number"
          value={formData.areaSqm}
          onChange={(e) => setFormData({ ...formData, areaSqm: parseFloat(e.target.value) })}
          className="input"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="label">土地利用</label>
        <select
          value={formData.landUse}
          onChange={(e) => setFormData({ ...formData, landUse: e.target.value })}
          className="input"
          required
          disabled={isLoading}
        >
          <option value="">選択してください</option>
          <option value="agricultural">農地</option>
          <option value="forest">山林</option>
          <option value="industrial">工業用地</option>
          <option value="commercial">商業用地</option>
          <option value="residential">住宅用地</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1" loading={isLoading}>
          {site ? '更新' : '登録'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
      </div>
    </form>
  );
};
