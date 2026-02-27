import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Coffee, UtensilsCrossed, Cake, IceCream, Wine,
    Loader2, ShoppingCart, Plus, Minus, Trash2,
    BellRing, Send, Receipt, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { toast } from "sonner";
import * as menuApi from "@/api/menuApi";
import * as orderApi from "@/api/orderApi";
import * as notificationApi from "@/api/notificationApi";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Coffee,
    IceCream,
    UtensilsCrossed,
    Wine,
    Cake,
};

interface CartItem extends menuApi.MenuItem {
    quantity: number;
}

export default function CafeOrder() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [showTableModal, setShowTableModal] = useState(false);
    const [staffAction, setStaffAction] = useState<'waiter_call' | 'bill_request' | null>(null);

    // Fetch categories and menu items
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['publicCategories'],
        queryFn: menuApi.getCategories
    });

    const { data: allMenuItems = [], isLoading: itemsLoading } = useQuery({
        queryKey: ['publicMenuItems'],
        queryFn: () => menuApi.getPublicMenuItems()
    });

    // Mutations
    const orderMutation = useMutation({
        mutationFn: orderApi.createOrder,
        onSuccess: () => {
            toast.success("Commande envoyée en cuisine !");
            setCart([]);
            setShowTableModal(false);
        },
        onError: () => {
            toast.error("Erreur lors de l'envoi de la commande.");
        }
    });

    const staffMutation = useMutation({
        mutationFn: (data: { type: 'waiter_call' | 'bill_request', table: string }) =>
            data.type === 'waiter_call'
                ? notificationApi.callWaiter(data.table)
                : notificationApi.requestBill(data.table),
        onSuccess: (_, variables) => {
            toast.success(variables.type === 'waiter_call' ? "Le serveur arrive !" : "L'addition a été demandée.");
            setShowTableModal(false);
            setStaffAction(null);
        },
        onError: (error) => {
            console.error("Staff mutation error:", error);
            toast.error("Une erreur est survenue.");
        }
    });

    // Cart operations
    const addToCart = (item: menuApi.MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(`${item.name} ajouté`, { duration: 1500 });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const handleAction = () => {
        if (!tableNumber) {
            toast.error("Numéro de table requis");
            return;
        }

        if (staffAction) {
            staffMutation.mutate({ type: staffAction, table: tableNumber });
        } else {
            orderMutation.mutate({
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                tableNumber,
                totalAmount: cartTotal,
                status: 'pending'
            });
        }
    };

    const activeCategories = categories.filter(c => c.isActive).sort((a, b) => a.order - b.order);

    const filteredItems = activeCategory
        ? allMenuItems.filter(item => {
            const categoryId = typeof item.category === 'object' ? item.category.id : item.category;
            return categoryId === activeCategory;
        })
        : allMenuItems;

    if (categoriesLoading || itemsLoading) {
        return (
            <PublicLayout>
                <div className="flex items-center justify-center h-screen bg-background">
                    <Loader2 className="w-10 h-10 animate-spin text-accent" />
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            {/* Header Space */}
            <div className="pt-24 pb-10 bg-background border-b border-border/40">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-display text-3xl font-bold text-foreground">Passer une commande</h1>
                    <p className="text-muted-foreground mt-2">Choisissez vos produits et notre équipe s'occupe du reste</p>
                </div>
            </div>

            {/* Menu & Interface */}
            <section className="pb-32 min-h-screen bg-background">
                <div className="container mx-auto px-4">

                    {/* Categories Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto py-6 no-scrollbar sticky top-[72px] z-20 bg-background pt-2 border-b">
                        <Button
                            variant={activeCategory === null ? "accent" : "outline"}
                            onClick={() => setActiveCategory(null)}
                            className="rounded-full px-6 flex-shrink-0"
                        >
                            Tout
                        </Button>
                        {activeCategories.map((category) => {
                            const Icon = iconMap[category.icon] || Coffee;
                            const isActive = activeCategory === category.id;
                            return (
                                <Button
                                    key={category.id}
                                    variant={isActive ? "accent" : "outline"}
                                    onClick={() => setActiveCategory(category.id)}
                                    className="rounded-full px-6 gap-2 flex-shrink-0"
                                >
                                    <Icon className="w-4 h-4" />
                                    {category.name}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Menu items as cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col group"
                            >
                                <div className="relative h-32 sm:h-48 w-full bg-muted overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                            <UtensilsCrossed className="w-8 h-8 sm:w-12 sm:h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-xs font-bold text-accent shadow-sm border border-border/10">
                                        {item.price} DT
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="font-display text-xl font-bold text-foreground leading-tight">{item.name}</h3>
                                    {item.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">{item.description}</p>}
                                    <div className="mt-6">
                                        <Button
                                            variant="secondary"
                                            className="w-full rounded-xl font-bold active:scale-95 transition-transform"
                                            onClick={() => addToCart(item)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Ajouter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer Controls Overlay */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="rounded-xl px-4 h-12 border-border"
                            onClick={() => {
                                setStaffAction('waiter_call');
                                setShowTableModal(true);
                            }}
                        >
                            <BellRing className="w-5 h-5 mr-2 text-accent" />
                            <span className="hidden sm:inline">Serveur</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl px-4 h-12 border-border"
                            onClick={() => {
                                setStaffAction('bill_request');
                                setShowTableModal(true);
                            }}
                        >
                            <Receipt className="w-5 h-5 mr-2 text-accent" />
                            <span className="hidden sm:inline">Addition</span>
                        </Button>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="accent"
                                className="rounded-xl h-12 px-6 gap-3 shadow-sm relative font-bold"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>Voir mon panier</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md flex flex-col h-full rounded-t-3xl sm:rounded-l-3xl">
                            <SheetHeader className="pb-4 border-b">
                                <SheetTitle className="text-xl font-bold font-display px-2">
                                    Mon Panier ({cartTotal} DT)
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex-grow overflow-y-auto pt-4 pb-8 space-y-4 no-scrollbar px-2">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-3 rounded-2xl bg-muted/20 border border-border/10 items-center transition-all hover:bg-muted/30"
                                    >
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border/10">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                                    <UtensilsCrossed className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow flex flex-col min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-base text-foreground truncate pr-2">{item.name}</h4>
                                                <button
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    onClick={() => removeFromCart(item.id)}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-accent font-bold text-lg">{item.price} DT</span>

                                                <div className="flex items-center gap-3 bg-background/50 p-1 rounded-xl border border-border/40">
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-20"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {cart.length === 0 && (
                                    <div className="text-center py-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingCart className="w-10 h-10 text-muted-foreground/20" />
                                        </div>
                                        <p className="font-bold text-foreground">Votre panier est vide</p>
                                        <p className="text-sm text-muted-foreground mt-1 px-10 text-center">Parcourez notre menu pour ajouter des articles.</p>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <SheetFooter className="p-4 bg-background border-t border-border/10 !flex-row items-center gap-4 mt-auto">
                                    <div className="flex flex-col justify-center min-w-[80px]">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-foreground">{cartTotal}</span>
                                            <span className="text-[10px] font-bold text-accent">DT</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="flex-grow h-12 rounded-xl text-sm font-bold gap-2 shadow-md shadow-accent/10"
                                        variant="accent"
                                        onClick={() => {
                                            setStaffAction(null);
                                            setShowTableModal(true);
                                        }}
                                    >
                                        <Send className="w-4 h-4" />
                                        Commander maintenant
                                    </Button>
                                </SheetFooter>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Unified Table Number Dialog */}
            <AnimatePresence>
                {showTableModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/40 backdrop-blur-md"
                            onClick={() => setShowTableModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-card border border-border/40 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-6 right-6 p-2 text-muted-foreground rounded-2xl hover:bg-muted"
                                onClick={() => setShowTableModal(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    {staffAction === 'waiter_call' ? <BellRing className="w-10 h-10 text-accent animate-bounce" /> :
                                        staffAction === 'bill_request' ? <Receipt className="w-10 h-10 text-accent" /> :
                                            <ShoppingCart className="w-10 h-10 text-accent" />}
                                </div>
                                <h2 className="text-3xl font-black font-display text-foreground">Votre Table</h2>
                                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                                    {staffAction === 'waiter_call' ? "Un équipier arrive pour vous assister." :
                                        staffAction === 'bill_request' ? "Nous préparons votre addition." :
                                            "Dernière étape avant la dégustation !"}
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="relative group">
                                    <Input
                                        autoFocus
                                        placeholder="N° de table"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="h-20 text-center text-4xl font-black rounded-3xl border-border/40 focus-visible:ring-accent bg-muted/30 border-2 transition-all duration-300 focus:border-accent group-hover:border-accent/20"
                                    />
                                    <div className="absolute inset-0 rounded-3xl pointer-events-none group-focus-within:ring-4 ring-accent/10 transition-all duration-300" />
                                </div>
                                <Button
                                    className="w-full h-16 rounded-[1.5rem] text-xl font-black gap-4 shadow-2xl shadow-accent/20 transition-all duration-300 hover:shadow-accent/40 active:scale-95 py-4"
                                    variant="accent"
                                    onClick={handleAction}
                                    disabled={orderMutation.isPending || staffMutation.isPending}
                                >
                                    {(orderMutation.isPending || staffMutation.isPending) ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span>Confirmer</span>
                                            <Send className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </PublicLayout>
    );
}
