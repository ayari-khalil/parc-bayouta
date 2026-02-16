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
            <div className="pt-24 pb-8 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-display text-3xl font-bold text-foreground">Passer une commande</h1>
                    <p className="text-muted-foreground mt-2">Choisissez vos produits et notre équipe s'occupe du reste</p>
                </div>
            </div>

            {/* Menu & Interface */}
            <section className="pb-32 min-h-screen bg-background">
                <div className="container mx-auto px-4">

                    {/* Categories Horizontal Scroll */}
                    <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar sticky top-[72px] z-20 bg-background/80 backdrop-blur-md pt-2">
                        <Button
                            variant={activeCategory === null ? "accent" : "outline"}
                            onClick={() => setActiveCategory(null)}
                            className="rounded-full px-6 flex-shrink-0"
                        >
                            Tout
                        </Button>
                        {activeCategories.map((category) => {
                            const Icon = iconMap[category.icon] || Coffee;
                            return (
                                <Button
                                    key={category.id}
                                    variant={activeCategory === category.id ? "accent" : "outline"}
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-4">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02, type: "spring", stiffness: 100 }}
                                className="bg-card border border-border/40 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-300 group"
                            >
                                <div className="relative h-32 sm:h-48 w-full bg-muted overflow-hidden">
                                    {item.image ? (
                                        <img
                                            src={`${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                            <UtensilsCrossed className="w-8 h-8 sm:w-12 sm:h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-background/80 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-accent border border-accent/10">
                                        {item.price} DT
                                    </div>
                                </div>
                                <div className="p-3 sm:p-6">
                                    <h3 className="font-display text-sm sm:text-xl font-bold text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-1 sm:line-clamp-2">{item.name}</h3>
                                    {item.description && <p className="text-[10px] sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2 sm:min-h-[40px]">{item.description}</p>}
                                    <div className="flex items-center justify-between mt-3 sm:mt-6">
                                        <Button
                                            variant="accent"
                                            className="rounded-full px-3 sm:px-6 py-3 sm:py-5 h-auto text-[10px] sm:text-sm font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95 flex-grow mr-2 sm:mr-3"
                                            onClick={() => addToCart(item)}
                                        >
                                            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            Ajouter
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frais</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer Controls Overlay */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="rounded-full px-3 sm:px-4 h-11 sm:h-12 border-accent/20 text-accent hover:bg-accent/10 text-xs sm:text-sm"
                            onClick={() => {
                                setStaffAction('waiter_call');
                                setShowTableModal(true);
                            }}
                        >
                            <BellRing className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                            <span>Appeler</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full px-3 sm:px-4 h-11 sm:h-12 border-accent/20 text-accent hover:bg-accent/10 text-xs sm:text-sm"
                            onClick={() => {
                                setStaffAction('bill_request');
                                setShowTableModal(true);
                            }}
                        >
                            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                            <span>Addition</span>
                        </Button>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="accent"
                                className="rounded-full h-12 px-6 gap-3 shadow-lg shadow-accent/20 relative"
                            >
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    <span className="font-bold">{cartTotal} DT</span>
                                </div>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-background">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md flex flex-col h-full rounded-t-[2rem] sm:rounded-l-[2rem]">
                            <SheetHeader className="pb-4 border-b">
                                <SheetTitle className="flex justify-between items-center text-xl font-bold font-display px-2">
                                    <span>Votre Panier ({cartCount})</span>
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex-grow overflow-y-auto py-4 space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3 px-2">
                                        {item.image && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                                <img
                                                    src={`${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.name}</h4>
                                                <button
                                                    className="p-1 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-accent font-bold text-sm">{item.price} DT</span>
                                                <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-full"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-full"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {cart.length === 0 && (
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Votre panier est vide</p>
                                        <p className="text-xs text-muted-foreground mt-1">Ajoutez des délices pour commencer</p>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <SheetFooter className="flex-col gap-4 mt-auto pt-4 border-t !inline-block w-full">
                                    <div className="flex justify-between items-center text-lg font-bold px-2 py-2">
                                        <span>Total</span>
                                        <span className="text-accent text-xl">{cartTotal} DT</span>
                                    </div>
                                    <Button
                                        className="w-full h-14 rounded-2xl text-lg font-bold gap-3 shadow-xl"
                                        variant="accent"
                                        onClick={() => {
                                            setStaffAction(null);
                                            setShowTableModal(true);
                                        }}
                                    >
                                        Finaliser Commande
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
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setShowTableModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-card border border-border w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
                        >
                            <button
                                className="absolute top-6 right-6 p-2 text-muted-foreground"
                                onClick={() => setShowTableModal(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {staffAction === 'waiter_call' ? <BellRing className="w-8 h-8 text-accent" /> :
                                        staffAction === 'bill_request' ? <Receipt className="w-8 h-8 text-accent" /> :
                                            <ShoppingCart className="w-8 h-8 text-accent" />}
                                </div>
                                <h2 className="text-2xl font-bold">Numéro de Table</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {staffAction === 'waiter_call' ? "Dites-nous où vous vous trouvez pour vous aider." :
                                        staffAction === 'bill_request' ? "Dites-nous votre numéro de table pour l'addition." :
                                            "Saisissez votre numéro de table pour envoyer la commande."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <Input
                                    autoFocus
                                    placeholder="Ex: 5"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="h-14 text-center text-xl font-bold rounded-2xl border-accent/20 focus-visible:ring-accent"
                                />
                                <Button
                                    className="w-full h-14 rounded-2xl text-lg font-bold gap-3"
                                    variant="accent"
                                    onClick={handleAction}
                                    disabled={orderMutation.isPending || staffMutation.isPending}
                                >
                                    {(orderMutation.isPending || staffMutation.isPending) ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    Confirmer
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </PublicLayout>
    );
}
