import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RechargeModal } from '../components/wallet/RechargeModal';

export default function RechargePage() {
  const navigate = useNavigate();

  return (
    <RechargeModal
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  );
}
