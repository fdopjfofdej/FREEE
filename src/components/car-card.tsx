// filepath: c:\Users\ericw\Desktop\freeauto.ch\src\components\car-card.tsx
import { Link } from "react-router-dom";
import { Car } from "@/types";
import { formatCurrency, slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Gauge,
  Power,
  Fuel,
  Building2,
  ShieldCheck,
  Award,
  ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const { t } = useTranslation();
  const carSlug = slugify(`${car.brand}-${car.model}-${car.year}`);
  
  return (
    <Link to={`/annonce/${car.id}/${carSlug}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Image Section */}
        <div className="relative aspect-[16/10]">
          {car.images.length > 0 ? (
            <img 
              src={car.images[0]} 
              alt={`${car.brand} ${car.model} ${car.year} - ${car.mileage}km`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {car.expertisee && (
              <Badge className="bg-emerald-600 text-black">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {t('Expertisée')}
              </Badge>
            )}
            {car.is_professional && (
              <Badge className="bg-blue-600 text-white">
                <Building2 className="w-3 h-3 mr-1" />
                {t('Pro')}
              </Badge>
            )}
            {car.premiere_main && (
              <Badge className="bg-primary text-white">
                <Award className="w-3 h-3 mr-1" />
                {t('1ère main')}
              </Badge>
            )}
          </div>
          
          {/* Image Counter */}
          {car.images.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-black/50 text-white border-0"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              {car.images.length}
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title & Price */}
          <div className="mb-3">
            <h2 className="font-medium text-lg mb-1 line-clamp-1">{car.title}</h2>
            <h3 className="text-xl font-bold text-primary">{formatCurrency(car.price)}</h3>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="flex flex-col items-center bg-gray-50 rounded p-2">
              <Calendar className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-sm font-medium">{car.year}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded p-2">
              <Gauge className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-sm font-medium">{car.mileage}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded p-2">
              <Power className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-sm font-medium">{car.puissance || "-"}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded p-2">
              <Fuel className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-sm font-medium">{car.carburant || "-"}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <Badge 
              variant="outline" 
              className={cn(
                "font-normal",
                car.transmission === "Automatique" && "border-primary text-primary",
                car.transmission === "Manuelle" && "bg-primary text-white"
              )}
            >
              {car.transmission || t("Non spécifié")}
            </Badge>

            {car.is_professional && car.company_name && (
              <span className="flex items-center">
                <Building2 className="w-4 w-4 mr-1" />
                {car.company_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}