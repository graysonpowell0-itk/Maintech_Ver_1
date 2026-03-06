
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Language = 'English' | 'Spanish' | 'Hindi';

export const translations = {
  English: {
    signIn: "Sign In",
    signUp: "Sign Up",
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",
    signInTo: "Sign in to Maintech",
    signUpFor: "Sign up for Maintech",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    role: "Role",
    processing: "Processing...",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    
    // Nav
    dashboard: "Pulse Dashboard",
    schedule: "Schedule",
    rooms: "Room Grid",
    tasks: "Tasks",
    inventory: "Inventory",
    approvals: "Approvals",
    reportIssue: "Report Issue",
    technician: "Technician",
    
    // Dashboard
    goodMorning: "Good Morning",
    systemFunctional: "System functional.",
    criticalAlerts: "critical alerts requiring attention.",
    urgentIssues: "Urgent Issues",
    viewAll: "View All",
    teamStatus: "Team Status",
    active: "Active",
    lowStock: "Low Stock Alerts",
    reorder: "Reorder",
    order: "Order",
    resolveNow: "Resolve Now",
    noUrgentIssues: "No urgent issues found.",
    inventoryOptimal: "Inventory levels are optimal.",
    pendingTasks: "Pending Tasks",
    avgResolution: "Avg Resolution",
    occupancy: "Occupancy",
    systemHealth: "System Health",
    
    // Assistant
    chatPlaceholder: "Type a message...",
    chatIntro: "Hello! I'm MT, your maintenance assistant. How can I help you today?",
    online: "Online",
    assistantTitle: "MT Assistant",
    
    // Auth Roles
    roleMaintenance: "Maintenance",
    roleAdmin: "Admin",
    roleStaff: "Other Staff",
    
    // Common
    search: "Search",
    searchTasks: "Search tasks, locations...",
    all: "All",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    saving: "Saving...",
    loading: "Loading...",
    submit: "Submit",
    download: "Download",
    upload: "Upload",
    
    // Task related
    taskList: "Task List",
    taskDetails: "Task Details",
    priority: "Priority",
    status: "Status",
    location: "Location",
    description: "Description",
    assignedTo: "Assigned To",
    completed: "Completed",
    pending: "Pending",
    inProgress: "In Progress",
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
    category: "Category",
    hvac: "HVAC",
    plumbing: "Plumbing",
    electrical: "Electrical",
    general: "General",
    completionProof: "Completion Proof",
    repairSummary: "Repair Summary",
    submitForApproval: "Submit for Approval",
    takePhoto: "Take Photo",
    uploadPhoto: "Upload Photo",
    
    // Room related
    roomNumber: "Room Number",
    roomStatus: "Room Status",
    occupied: "Occupied",
    vacant: "Vacant",
    checkoutDate: "Checkout Date",
    hskStatus: "HSK Status",
    clean: "Clean",
    dirty: "Dirty",
    outOfService: "Out of Service",
    inspected: "Inspected",
    
    // Inventory
    itemName: "Item Name",
    quantity: "Quantity",
    supplier: "Supplier",
    addItem: "Add Item",
    editItem: "Edit Item",
    deleteItem: "Delete Item",
    inStock: "In Stock",
    stockLevel: "Stock Level",
    
    // Approvals
    purchaseRequest: "Purchase Request",
    repairApproval: "Repair Approval",
    approve: "Approve",
    reject: "Reject",
    approved: "Approved",
    rejected: "Rejected",
    requestedBy: "Requested By",
    
    // Profile
    editProfile: "Edit Profile",
    name: "Name",
    avatar: "Avatar",
    changePhoto: "Change Photo",
    
    // Property
    propertyName: "Property Name",
    addProperty: "Add Property",
    propertySettings: "Property Settings",
    
    // Calendar
    calendar: "Calendar",
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    
    // Schematics
    schematics: "Schematics",
    uploadSchematic: "Upload Schematic",
    schematicName: "Schematic Name",
    fileName: "File Name",
    uploadedBy: "Uploaded By",
    roomLayout: "Room Layout",
    propertyLayout: "Property Layout",
    floorPlan: "Floor Plan",
    other: "Other"
  },
  Spanish: {
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    createAccount: "Crear Cuenta",
    welcomeBack: "Bienvenido",
    signInTo: "Inicia sesión en Maintech",
    signUpFor: "Regístrate en Maintech",
    email: "Correo Electrónico",
    password: "Contraseña",
    fullName: "Nombre Completo",
    role: "Rol",
    processing: "Procesando...",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    dontHaveAccount: "¿No tienes cuenta?",

    // Nav
    dashboard: "Panel Principal",
    schedule: "Calendario",
    rooms: "Habitaciones",
    tasks: "Tareas",
    inventory: "Inventario",
    approvals: "Aprobaciones",
    reportIssue: "Reportar Problema",
    technician: "Técnico",

    // Dashboard
    goodMorning: "Buenos Días",
    systemFunctional: "Sistema funcional.",
    criticalAlerts: "alertas críticas requieren atención.",
    urgentIssues: "Problemas Urgentes",
    viewAll: "Ver Todo",
    teamStatus: "Estado del Equipo",
    active: "Activo",
    lowStock: "Alertas de Stock",
    reorder: "Reordenar",
    order: "Pedir",
    resolveNow: "Resolver",
    noUrgentIssues: "No hay problemas urgentes.",
    inventoryOptimal: "Niveles de inventario óptimos.",
    pendingTasks: "Tareas Pendientes",
    avgResolution: "Resolución Prom.",
    occupancy: "Ocupación",
    systemHealth: "Salud del Sistema",

    // Assistant
    chatPlaceholder: "Escribe un mensaje...",
    chatIntro: "¡Hola! Soy MT, tu asistente de mantenimiento. ¿Cómo puedo ayudarte hoy?",
    online: "En línea",
    assistantTitle: "Asistente MT",

    // Auth Roles
    roleMaintenance: "Mantenimiento",
    roleAdmin: "Admin",
    roleStaff: "Otro Personal",
    
    // Common
    search: "Buscar",
    searchTasks: "Buscar tareas, ubicaciones...",
    all: "Todo",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    confirm: "Confirmar",
    saving: "Guardando...",
    loading: "Cargando...",
    submit: "Enviar",
    download: "Descargar",
    upload: "Subir",
    
    // Task related
    taskList: "Lista de Tareas",
    taskDetails: "Detalles de Tarea",
    priority: "Prioridad",
    status: "Estado",
    location: "Ubicación",
    description: "Descripción",
    assignedTo: "Asignado a",
    completed: "Completado",
    pending: "Pendiente",
    inProgress: "En Progreso",
    urgent: "Urgente",
    high: "Alto",
    medium: "Medio",
    low: "Bajo",
    category: "Categoría",
    hvac: "HVAC",
    plumbing: "Plomería",
    electrical: "Eléctrico",
    general: "General",
    completionProof: "Prueba de Finalización",
    repairSummary: "Resumen de Reparación",
    submitForApproval: "Enviar para Aprobación",
    takePhoto: "Tomar Foto",
    uploadPhoto: "Subir Foto",
    
    // Room related
    roomNumber: "Número de Habitación",
    roomStatus: "Estado de Habitación",
    occupied: "Ocupado",
    vacant: "Vacante",
    checkoutDate: "Fecha de Salida",
    hskStatus: "Estado HSK",
    clean: "Limpio",
    dirty: "Sucio",
    outOfService: "Fuera de Servicio",
    inspected: "Inspeccionado",
    
    // Inventory
    itemName: "Nombre del Artículo",
    quantity: "Cantidad",
    supplier: "Proveedor",
    addItem: "Agregar Artículo",
    editItem: "Editar Artículo",
    deleteItem: "Eliminar Artículo",
    inStock: "En Stock",
    stockLevel: "Nivel de Stock",
    
    // Approvals
    purchaseRequest: "Solicitud de Compra",
    repairApproval: "Aprobación de Reparación",
    approve: "Aprobar",
    reject: "Rechazar",
    approved: "Aprobado",
    rejected: "Rechazado",
    requestedBy: "Solicitado por",
    
    // Profile
    editProfile: "Editar Perfil",
    name: "Nombre",
    avatar: "Avatar",
    changePhoto: "Cambiar Foto",
    
    // Property
    propertyName: "Nombre de Propiedad",
    addProperty: "Agregar Propiedad",
    propertySettings: "Configuración de Propiedad",
    
    // Calendar
    calendar: "Calendario",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    
    // Schematics
    schematics: "Esquemáticos",
    uploadSchematic: "Subir Esquemático",
    schematicName: "Nombre del Esquemático",
    fileName: "Nombre del Archivo",
    uploadedBy: "Subido por",
    roomLayout: "Diseño de Habitación",
    propertyLayout: "Diseño de Propiedad",
    floorPlan: "Plano de Piso",
    other: "Otro"
  },
  Hindi: {
    signIn: "साइन इन करें",
    signUp: "साइन अप करें",
    createAccount: "खाता बनाएं",
    welcomeBack: "वापसी पर स्वागत है",
    signInTo: "Maintech में साइन इन करें",
    signUpFor: "Maintech के लिए साइन अप करें",
    email: "ईमेल पता",
    password: "पासवर्ड",
    fullName: "पूरा नाम",
    role: "भूमिका",
    processing: "प्रक्रिया जारी है...",
    alreadyHaveAccount: "क्या आपके पास पहले से एक खाता है?",
    dontHaveAccount: "क्या आपके पास खाता नहीं है?",

    // Nav
    dashboard: "डैशबोर्ड",
    schedule: "अनुसूची",
    rooms: "कक्ष ग्रिड",
    tasks: "कार्य",
    inventory: "इन्वेंटरी",
    approvals: "स्वीकृतियां",
    reportIssue: "समस्या रिपोर्ट करें",
    technician: "तकनीशियन",

    // Dashboard
    goodMorning: "सुप्रभात",
    systemFunctional: "सिस्टम कार्यात्मक।",
    criticalAlerts: "महत्वपूर्ण अलर्ट जिन पर ध्यान देने की आवश्यकता है।",
    urgentIssues: "अत्यावश्यक समस्याएं",
    viewAll: "सभी देखें",
    teamStatus: "टीम की स्थिति",
    active: "सक्रिय",
    lowStock: "कम स्टॉक अलर्ट",
    reorder: "पुनः ऑर्डर करें",
    order: "ऑर्डर करें",
    resolveNow: "अभी हल करें",
    noUrgentIssues: "कोई अत्यावश्यक समस्या नहीं मिली।",
    inventoryOptimal: "इन्वेंटरी स्तर इष्टतम हैं।",
    pendingTasks: "लंबित कार्य",
    avgResolution: "औसत समाधान",
    occupancy: "उपस्थिति",
    systemHealth: "सिस्टम स्वास्थ्य",

    // Assistant
    chatPlaceholder: "एक संदेश टाइप करें...",
    chatIntro: "नमस्ते! मैं MT हूँ, आपका रखरखाव सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    online: "ऑनलाइन",
    assistantTitle: "MT सहायक",

    // Auth Roles
    roleMaintenance: "रखरखाव",
    roleAdmin: "व्यवस्थापक",
    roleStaff: "अन्य कर्मचारी",
    
    // Common
    search: "खोजें",
    searchTasks: "कार्य, स्थान खोजें...",
    all: "सभी",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    close: "बंद करें",
    confirm: "पुष्टि करें",
    saving: "सहेजा जा रहा है...",
    loading: "लोड हो रहा है...",
    submit: "जमा करें",
    download: "डाउनलोड करें",
    upload: "अपलोड करें",
    
    // Task related
    taskList: "कार्य सूची",
    taskDetails: "कार्य विवरण",
    priority: "प्राथमिकता",
    status: "स्थिति",
    location: "स्थान",
    description: "विवरण",
    assignedTo: "सौंपा गया",
    completed: "पूर्ण",
    pending: "लंबित",
    inProgress: "प्रगति में",
    urgent: "अत्यावश्यक",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    category: "श्रेणी",
    hvac: "HVAC",
    plumbing: "प्लंबिंग",
    electrical: "विद्युत",
    general: "सामान्य",
    completionProof: "पूर्णता प्रमाण",
    repairSummary: "मरम्मत सारांश",
    submitForApproval: "स्वीकृति के लिए जमा करें",
    takePhoto: "फोटो लें",
    uploadPhoto: "फोटो अपलोड करें",
    
    // Room related
    roomNumber: "कक्ष संख्या",
    roomStatus: "कक्ष स्थिति",
    occupancy: "उपस्थिति",
    occupt: "खाली",
    checkoutDate: "चेकआउट तिथि",
    hskStatus: "HSK स्थिति",
    clean: "साफ",
    dirty: "गंदा",
    outOfService: "सेवा से बाहर",
    inspected: "निरीक्षण किया गया",
    
    // Inventory
    itemName: "वस्तु का नाम",
    quantity: "मात्रा",
    supplier: "आपूर्तिकर्ता",
    addItem: "वस्तु जोड़ें",
    editItem: "वस्तु संपादित करें",
    deleteItem: "वस्तु हटाएं",
    inStock: "स्टॉक में",
    stockLevel: "स्टॉक स्तर",
    
    // Approvals
    purchaseRequest: "खरीद अनुरोध",
    repairApproval: "मरम्मत स्वीकृति",
    approve: "स्वीकृत करें",
    reject: "अस्वीकार करें",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    requestedBy: "द्वारा अनुरोधित",
    
    // Profile
    editProfile: "प्रोफ़ाइल संपादित करें",
    name: "नाम",
    avatar: "अवतार",
    changePhoto: "फोटो बदलें",
    
    // Property
    propertyName: "संपत्ति का नाम",
    addProperty: "संपत्ति जोड़ें",
    propertySettings: "संपत्ति सेटिंग्स",
    
    // Calendar
    calendar: "कैलेंडर",
    today: "आज",
    month: "महीना",
    week: "सप्ताह",
    day: "दिन",
    
    // Schematics
    schematics: "योजनाएं",
    uploadSchematic: "योजना अपलोड करें",
    schematicName: "योजना का नाम",
    fileName: "फ़ाइल का नाम",
    uploadedBy: "द्वारा अपलोड किया गया",
    roomLayout: "कक्ष लेआउट",
    propertyLayout: "संपत्ति लेआउट",
    floorPlan: "मंजिल योजना",
    other: "अन्य"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['English'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem('maintech_language') as Language) || 'English';
    } catch {
      return 'English';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maintech_language', language);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
