import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CarFilter,
  TYPE_VEHICULES,
  CARBURANTS,
  TRANSMISSIONS,
  COULEURS,
} from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  SlidersHorizontal,
  MapPin,
  Euro,
  Calendar,
  Gauge,
  Power,
  Car,
  Paintbrush,
  Check,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FiltersProps {
  onFilterChange: (filters: CarFilter) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<CarFilter>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: keyof CarFilter, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleMultiSelect = (key: keyof CarFilter, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
    setActiveFilter(null);
  };

  const isFilterActive = (
    key:
      | "city"
      | "price"
      | "year"
      | "type"
      | "fuel"
      | "transmission"
      | "color"
      | "options"
  ): boolean => {
    if (key === "city" && filters.city) return true;
    if (key === "price" && (filters.minPrice || filters.maxPrice)) return true;
    if (key === "year" && (filters.minYear || filters.maxMileage)) return true;
    if (key === "type" && filters.type_vehicule?.length) return true;
    if (key === "fuel" && filters.carburant?.length) return true;
    if (key === "transmission" && filters.transmission?.length) return true;
    if (key === "color" && filters.couleur?.length) return true;
    if (
      key === "options" &&
      (filters.premiere_main ||
        filters.expertisee ||
        filters.is_professional ||
        filters.garantie)
    )
      return true;
    return false;
  };

  const getActiveFiltersCount = (): number => {
    return Object.keys(filters).length;
  };

  // Handle horizontal scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const renderFilterContent = () => {
    switch (activeFilter) {
      case "city":
        return (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("Ville")}</Label>
              <Input
                placeholder={t("Rechercher une ville")}
                value={filters.city || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "city",
                    e.target.value ? e.target.value : ""
                  )
                }
                className="bg-white"
                autoFocus
              />
            </div>
          </div>
        );
      case "price":
        return (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("Prix minimum")}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("Prix maximum")}
                </Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        );
      case "year":
        return (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("Année minimum")}
                </Label>
                <Input
                  type="number"
                  placeholder="2010"
                  value={filters.minYear || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minYear",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("Kilométrage max")}
                </Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.maxMileage || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxMileage",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        );
      case "type":
        return (
          <div className="p-4">
            <ScrollArea className="h-[300px] pr-3">
              <div className="grid grid-cols-2 gap-2">
                {TYPE_VEHICULES.map((type) => {
                  const isSelected = (filters.type_vehicule || []).includes(
                    type
                  );
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => handleMultiSelect("type_vehicule", type)}
                    >
                      {isSelected && <Check className="h-3 w-3 mr-2" />}
                      {t(type)}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        );
      case "fuel":
        return (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {CARBURANTS.map((carburant) => {
                const isSelected = (filters.carburant || []).includes(
                  carburant
                );
                return (
                  <Button
                    key={carburant}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => handleMultiSelect("carburant", carburant)}
                  >
                    {isSelected && <Check className="h-3 w-3 mr-2" />}
                    {t(carburant)}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      case "transmission":
        return (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {TRANSMISSIONS.map((transmission) => {
                const isSelected = (filters.transmission || []).includes(
                  transmission
                );
                return (
                  <Button
                    key={transmission}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() =>
                      handleMultiSelect("transmission", transmission)
                    }
                  >
                    {isSelected && <Check className="h-3 w-3 mr-2" />}
                    {t(transmission)}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      case "color":
        return (
          <div className="p-4">
            <ScrollArea className="h-[300px] pr-3">
              <div className="grid grid-cols-2 gap-2">
                {COULEURS.map((couleur) => {
                  const isSelected = (filters.couleur || []).includes(couleur);
                  return (
                    <Button
                      key={couleur}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => handleMultiSelect("couleur", couleur)}
                    >
                      {isSelected && <Check className="h-3 w-3 mr-2" />}
                      {t(couleur)}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        );
      case "options":
        return (
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                <Label className="cursor-pointer">{t("Première main")}</Label>
                <Switch
                  checked={!!filters.premiere_main}
                  onCheckedChange={(checked) =>
                    handleFilterChange("premiere_main", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                <Label className="cursor-pointer">
                  {t("Véhicules expertisés")}
                </Label>
                <Switch
                  checked={!!filters.expertisee}
                  onCheckedChange={(checked) =>
                    handleFilterChange("expertisee", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                <Label className="cursor-pointer">
                  {t("Vendeurs professionnels")}
                </Label>
                <Switch
                  checked={!!filters.is_professional}
                  onCheckedChange={(checked) =>
                    handleFilterChange("is_professional", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                <Label className="cursor-pointer">{t("Garantie")}</Label>
                <Switch
                  checked={!!filters.garantie}
                  onCheckedChange={(checked) =>
                    handleFilterChange("garantie", checked)
                  }
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full">
      {/* Horizontal filter bar */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "whitespace-nowrap",
            getActiveFiltersCount() > 0 && "pr-6 relative"
          )}
          onClick={resetFilters}
        >
          <SlidersHorizontal className="h-3 w-3 mr-2" />
          {t("Tous les filtres")}
          {getActiveFiltersCount() > 0 && (
            <Badge
              variant="default"
              className="absolute right-1 top-1 h-4 min-w-[16px] px-1 text-xs"
            >
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

        {/* City filter */}
        <Dialog
          open={activeFilter === "city"}
          onOpenChange={(open) => setActiveFilter(open ? "city" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("city") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <MapPin className="h-3 w-3 mr-2" />
              {t("Ville")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Localisation")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("city", "")}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Price filter */}
        <Dialog
          open={activeFilter === "price"}
          onOpenChange={(open) => setActiveFilter(open ? "price" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("price") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <Euro className="h-3 w-3 mr-2" />
              {t("Prix")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Prix")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleFilterChange("minPrice", undefined);
                  handleFilterChange("maxPrice", undefined);
                }}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Year and Mileage filter */}
        <Dialog
          open={activeFilter === "year"}
          onOpenChange={(open) => setActiveFilter(open ? "year" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("year") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <Calendar className="h-3 w-3 mr-2" />
              {t("Année et km")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Année et kilométrage")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleFilterChange("minYear", undefined);
                  handleFilterChange("maxMileage", undefined);
                }}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vehicle Type filter */}
        <Dialog
          open={activeFilter === "type"}
          onOpenChange={(open) => setActiveFilter(open ? "type" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("type") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <Car className="h-3 w-3 mr-2" />
              {t("Type")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Type de véhicule")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("type_vehicule", undefined)}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fuel filter */}
        <Dialog
          open={activeFilter === "fuel"}
          onOpenChange={(open) => setActiveFilter(open ? "fuel" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("fuel") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <Gauge className="h-3 w-3 mr-2" />
              {t("Carburant")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Carburant")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("carburant", undefined)}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transmission filter */}
        <Dialog
          open={activeFilter === "transmission"}
          onOpenChange={(open) => setActiveFilter(open ? "transmission" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("transmission") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <Power className="h-3 w-3 mr-2" />
              {t("Transmission")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Transmission")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("transmission", undefined)}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Color filter */}
        <Dialog
          open={activeFilter === "color"}
          onOpenChange={(open) => setActiveFilter(open ? "color" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("color") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <Paintbrush className="h-3 w-3 mr-2" />
              {t("Couleur")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Couleur")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("couleur", undefined)}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Options filter */}
        <Dialog
          open={activeFilter === "options"}
          onOpenChange={(open) => setActiveFilter(open ? "options" : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant={isFilterActive("options") ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3 w-3 mr-2" />
              {t("Options")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Options")}</DialogTitle>
            </DialogHeader>
            {renderFilterContent()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleFilterChange("premiere_main", undefined);
                  handleFilterChange("expertisee", undefined);
                  handleFilterChange("is_professional", undefined);
                  handleFilterChange("garantie", undefined);
                }}
              >
                {t("Réinitialiser")}
              </Button>
              <Button size="sm" onClick={() => setActiveFilter(null)}>
                {t("Appliquer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
