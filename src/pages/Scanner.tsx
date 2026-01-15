import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { QrCode, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Scanner() {
  return (
    <Layout>
      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center">
            <QrCode className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Scanner un QR Code
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
            Scannez le QR code d'une fiche MSP pour y accéder directement
          </p>

          <Button size="lg" className="gap-2">
            <Camera className="w-5 h-5" />
            Ouvrir l'appareil photo
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            Le scanner ouvrira automatiquement la fiche MSP correspondante
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
