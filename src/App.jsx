import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Settings,
  Cpu,
  Smartphone,
  LayoutTemplate,
  Shield,
  Zap,
  Battery,
  Database,
  HardDrive,
  Share2,
  Terminal,
  Download,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  X,
  Edit3,
  Check,
  Loader2,
  Home,
  User,
  Lock,
  Wifi,
  Bluetooth,
  Camera,
  Music,
  Video,
  Image as ImageIcon,
  Box,
  Layers,
  Server,
  Cloud,
  Activity,
  Code,
  GitBranch,
  KeyRound,
  Monitor,
  Radio,
  Speaker,
  Watch,
  Fingerprint,
  ExternalLink,
  Globe,
  Briefcase,
  Rocket,
  Compass,
  Book,
  Folder,
  Calendar,
  Bell,
  Star,
  ShieldAlert,
  AlertTriangle,
  Eye,
  RefreshCw,
  Palette,
  PenTool,
  Coffee,
  MessageSquare,
} from "lucide-react";

// Expanded Icon Library for the Picker
const AVAILABLE_ICONS = {
  Settings,
  Cpu,
  Smartphone,
  LayoutTemplate,
  Shield,
  Zap,
  Battery,
  Database,
  HardDrive,
  Share2,
  Terminal,
  Download,
  Home,
  User,
  Lock,
  Wifi,
  Bluetooth,
  Camera,
  Music,
  Video,
  ImageIcon,
  Box,
  Layers,
  Server,
  Cloud,
  Activity,
  Code,
  GitBranch,
  KeyRound,
  Monitor,
  Radio,
  Speaker,
  Watch,
  Fingerprint,
  Globe,
  Briefcase,
  Rocket,
  Compass,
  Book,
  Folder,
  Calendar,
  Bell,
  Star,
  ShieldAlert,
  AlertTriangle,
  Eye,
  RefreshCw,
  Palette,
  PenTool,
  Coffee,
  MessageSquare,
};

async function generateWithGemini(
  apiKeyParam,
  model,
  prompt,
  systemInstruction = "You are an expert systems architect.",
  isJson = false,
) {
  // Use environment key if provided, otherwise fallback to user state
  const apiKey = apiKeyParam || "";
  const selectedModel = model || "gemini-2.5-flash-preview-09-2025";

  // Simplest Quick Fix: Prepend a CORS proxy to bypass browser restrictions
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  if (isJson) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          content: { type: "STRING" },
        },
        required: ["title", "content"],
      },
    };
  }

  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.error?.message || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No response generated.");

      if (isJson) {
        // Cleaning potential markdown wrappers
        const clean = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(clean);
      }
      return text;
    } catch (error) {
      if (i === 4) throw new Error("Connection failed: " + error.message);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

// --- Default Project Configuration ---
const defaultData = {
  title: { text: "Project Zero", icon: "Box" },
  version: "0.1.0-alpha",
  directive: {
    title: "Project Directive",
    description:
      "Describe the high-level vision, constraints, and goals for this project. Use this workspace to architect ideas and prototype features.",
  },
  overviewPrompt: "You are a systems engineer.",
  promptTemplate:
    'Review this project feature: "$feature - $content" within the context of $project.\n\nProvide 1 advanced technical alternative, optimization, or improvement for this specific $section feature in the context of modern system architecture. Output ONLY a valid JSON object.',
  sections: [],
};

// --- Reusable Editable Field ---
const EditableField = ({
  value,
  onChange,
  isTextArea = false,
  className = "",
  placeholder = "Empty...",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      if (!isTextArea) inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing, isTextArea]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempVal.trim() !== value) onChange(tempVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isTextArea) handleBlur();
    if (e.key === "Escape") {
      setTempVal(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonClasses = `bg-gray-800 text-white w-full border border-emerald-500/50 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 p-1 ${className}`;
    return isTextArea ? (
      <textarea
        ref={inputRef}
        value={tempVal}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${commonClasses} resize-y min-h-[80px] text-sm`}
      />
    ) : (
      <input
        ref={inputRef}
        value={tempVal}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={commonClasses}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-gray-800/50 rounded border border-transparent hover:border-gray-700/50 transition-colors p-1 -m-1 ${className}`}
      title="Double click to edit"
    >
      {value || <span className="text-gray-600 italic">{placeholder}</span>}
    </div>
  );
};

export default function App() {
  const [overviewPrompt, setOverviewPrompt] = useState(
    "You are a systems engineer.",
  );
  const fileInputRef = useRef(null);

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("gemini_api_key") || "",
  );
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem("gemini_model") || "gemini-2.5-flash",
  );
  const [showApiModal, setShowApiModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // Model Picker State
  const [modelSearch, setModelSearch] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Data State with Autosave Loading
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("project_maker_autosave");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse autosave", e);
      }
    }
    return defaultData;
  });

  const [activeTabId, setActiveTabId] = useState("overview");
  const [geminiModal, setGeminiModal] = useState({
    isOpen: false,
    title: "",
    response: "",
    isLoading: false,
    error: "",
  });
  const [iconPicker, setIconPicker] = useState({
    isOpen: false,
    sectionId: null,
  });

  // Autosave Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("project_maker_autosave", JSON.stringify(data));
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  // Handle Token Save
  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem("gemini_api_key", tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setShowApiModal(false);
      setTempApiKey("");
    }
  };
  const fetchModels = async (key) => {
    if (!key) return;
    setIsFetchingModels(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      );
      const result = await res.json();
      if (result.models) {
        // Filter for models that support generateContent
        const filtered = result.models
          .filter((m) =>
            m.supportedGenerationMethods.includes("generateContent"),
          )
          .map((m) => ({
            name: m.name.split("/").pop(),
            displayName: m.displayName,
            description: m.description,
          }));
        setAvailableModels(filtered);
      }
    } catch (e) {
      console.error("Failed to fetch models", e);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", tempApiKey.trim());
    localStorage.setItem("gemini_model", selectedModel);
    setApiKey(tempApiKey.trim());
    setShowApiModal(false);
  };
  useEffect(() => {
    if (showApiModal && tempApiKey) {
      fetchModels(tempApiKey);
    }
  }, [showApiModal, tempApiKey]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.title && parsed.directive && parsed.sections) {
          setData(parsed);
          setActiveTabId("overview");
        } else {
          setGeminiModal({
            isOpen: true,
            title: "Upload Error",
            response:
              "The uploaded file is missing required project structures.",
            error: "Invalid format",
          });
        }
      } catch (err) {
        setGeminiModal({
          isOpen: true,
          title: "Upload Error",
          response: "Could not parse the JSON file. It might be corrupted.",
          error: err.message,
        });
      }
      e.target.value = null; // Reset input so same file can be uploaded again
    };
    reader.readAsText(file);
  };

  // Update Data Helpers
  const updateSection = (sectionId, field, value) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, [field]: value } : sec,
      ),
    }));
  };

  const updateItem = (sectionId, itemId, field, value) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item,
          ),
        };
      }),
    }));
  };

  const deleteItem = (sectionId, itemId) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.filter((item) => item.id !== itemId),
        };
      }),
    }));
  };

  const addItem = (sectionId) => {
    const newItem = {
      id: `new_${Date.now()}`,
      title: "New Feature / Component",
      content:
        "Describe the functionality, specifications, or strategy here...",
      isRecommended: false,
    };
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, items: [...sec.items, newItem] } : sec,
      ),
    }));
  };

  const deleteSection = (sectionId) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== sectionId),
    }));
    setActiveTabId("overview");
  };

  const addSection = () => {
    const newId = `sec_${Date.now()}`;
    const newSection = {
      id: newId,
      icon: "Box",
      title: "New Architectural Module",
      description: "Describe this module's purpose and scope...",
      items: [],
    };
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setActiveTabId(newId);
  };

  const handleIconSelect = (iconName) => {
    if (iconPicker.sectionId === "Title") {
      setData((prev) => ({
        ...prev,
        title: { ...prev.title, icon: iconName },
      }));
    } else {
      updateSection(iconPicker.sectionId, "icon", iconName);
    }
    setIconPicker({ isOpen: false, sectionId: null });
  };

  const exportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    const safeTitle = data.title.text.toLowerCase().replace(/[^a-z0-9]/g, "_");
    a.download = `${safeTitle}_config_${Date.now()}.json`;
    a.click();
  };

  // LLM: Inline Item Generation
  const triggerInlineAiAlternative = async (
    sectionId,
    featureTitle,
    featureContent,
  ) => {
    if (!apiKey) return setShowApiModal(true);

    setGeminiModal({
      isOpen: true,
      title: `✨ Generating AI Alternative...`,
      response: "",
      isLoading: true,
      error: "",
    });
    try {
      const template = data.promptTemplate || defaultData.promptTemplate;
      const sectionTitle =
        data.sections.find((s) => s.id === sectionId)?.title || "Section";

      const prompt = template
        .replace(/\$feature/g, featureTitle)
        .replace(/\$content/g, featureContent)
        .replace(/\$project/g, data.title.text)
        .replace(/\$section/g, sectionTitle);

      const aiObject = await generateWithGemini(
        apiKey,
        selectedModel,
        prompt,
        overviewPrompt,
        true,
      );

      const newItem = {
        id: `ai_${Date.now()}`,
        title: aiObject.title,
        content: aiObject.content,
        isRecommended: false,
        isAiOption: true,
      };

      setData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, items: [...sec.items, newItem] }
            : sec,
        ),
      }));
      setGeminiModal({
        isOpen: false,
        title: "",
        response: "",
        isLoading: false,
        error: "",
      });
    } catch (error) {
      setGeminiModal((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to generate inline item. " + error.message,
      }));
    }
  };

  // LLM: Text Popups
  const triggerTextGemini = async (title, promptContext, systemPrompt) => {
    if (!apiKey) return setShowApiModal(true);

    setGeminiModal({
      isOpen: true,
      title: title,
      response: "",
      isLoading: true,
      error: "",
    });
    try {
      const response = await generateWithGemini(
        apiKey,
        selectedModel,
        promptContext,
        systemPrompt,
        false,
      );
      setGeminiModal((prev) => ({ ...prev, isLoading: false, response }));
    } catch (error) {
      setGeminiModal((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to connect to AI Assistant.",
      }));
    }
  };

  const filteredModels = availableModels.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.displayName.toLowerCase().includes(modelSearch.toLowerCase()),
  );

  const triggerGeminiAudit = () => {
    const prompt = `Please audit this project configuration:\n\n${JSON.stringify(data, null, 2)}\n\nAct as a senior systems architect. Identify any potential bottlenecks, logical flaws, missing modern optimizations, or scalability concerns. Provide 3 specific bullet points of constructive feedback.`;
    triggerTextGemini(
      "✨ Project Architecture Audit",
      prompt,
      "You are an expert systems architect and technical lead.",
    );
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg relative group">
        <h2 className="text-xl font-bold text-gray-100 mb-2">
          <EditableField
            value={data.directive.title}
            onChange={(val) =>
              setData({ ...data, directive: { ...data.directive, title: val } })
            }
          />
        </h2>
        <div className="text-gray-400 mb-4 text-sm leading-relaxed">
          <EditableField
            isTextArea
            value={data.directive.description}
            onChange={(val) =>
              setData({
                ...data,
                directive: { ...data.directive, description: val },
              })
            }
          />
        </div>
        {apiKey && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() =>
                triggerTextGemini(
                  "✨ Directive Alternatives",
                  `Review this project directive: "${data.directive.description}". Provide 2-3 better worded, more specific engineering/architectural directives.`,
                  "You are an expert tech lead and product manager.",
                )
              }
              className="text-xs flex items-center gap-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 px-2 py-1 rounded transition-colors"
            >
              <Sparkles className="w-3 h-3" /> Alternatives
            </button>
          </div>
        )}
      </div>

      {apiKey && (
        <>
          <div className="p-4 rounded-lg border border-indigo-500/30 bg-indigo-950/30 relative group">
            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-medium text-sm">
              <Terminal className="w-4 h-4" /> Generation Prompt Template
            </div>
            <div className="text-gray-300 font-mono text-xs leading-relaxed">
              <EditableField
                isTextArea
                value={data.promptTemplate || defaultData.promptTemplate}
                onChange={(val) => setData({ ...data, promptTemplate: val })}
              />
            </div>
            <div className="mt-3 pt-3 border-t border-indigo-500/20 text-[10px] text-gray-500 font-mono">
              This prompt affects the "Generate Inline Alternative" feature.
              Available variables:{" "}
              <span className="text-indigo-400/70">$project</span>,{" "}
              <span className="text-indigo-400/70">$section</span>,{" "}
              <span className="text-indigo-400/70">$feature</span>,{" "}
              <span className="text-indigo-400/70">$content</span>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-indigo-500/30 bg-indigo-950/30 relative group">
            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-medium text-sm">
              <Terminal className="w-4 h-4" /> Overview Prompt Template
            </div>
            <div className="text-gray-300 font-mono text-xs leading-relaxed">
              <EditableField
                isTextArea
                value={data.overviewPrompt || defaultData.overviewPrompt}
                onChange={(val) => setData({ ...data, overviewPrompt: val })}
              />
            </div>
            <div className="mt-3 pt-3 border-t border-indigo-500/20 text-[10px] text-gray-500 font-mono">
              This prompt affects the "Audit Project" feature.
            </div>
          </div>
        </>
      )}

      <div className="p-4 rounded-lg border border-dashed border-gray-700 text-center text-sm text-gray-500">
        <Edit3 className="w-5 h-5 mx-auto mb-2 opacity-50" />
        <p>
          This is a WYSIWYG Editor. Double-click any text, title, or description
          to edit it. Your progress autosaves locally.
        </p>
      </div>
    </div>
  );

  const renderSection = (section) => {
    const SectionIcon = AVAILABLE_ICONS[section.icon] || Settings;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="mb-6 border-b border-gray-800 pb-4 relative group flex items-start gap-4">
          <button
            onClick={() =>
              setIconPicker({ isOpen: true, sectionId: section.id })
            }
            className="p-3 bg-gray-900 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-800 rounded-xl text-emerald-500 transition-all shrink-0 mt-1 shadow-sm"
            title="Change Icon"
          >
            <SectionIcon className="w-6 h-6" />
          </button>

          <div className="flex-1 pr-10">
            <h2 className="text-2xl font-bold text-gray-100">
              <EditableField
                value={section.title}
                onChange={(val) => updateSection(section.id, "title", val)}
              />
            </h2>
            <div className="text-gray-400 mt-1">
              <EditableField
                value={section.description}
                onChange={(val) =>
                  updateSection(section.id, "description", val)
                }
              />
            </div>
          </div>

          <button
            onClick={() => deleteSection(section.id)}
            className="absolute top-0 right-0 p-2 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete entire section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {section.items.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-lg border relative group transition-colors ${item.isAiOption ? "border-indigo-500/50 bg-indigo-950/20" : item.isRecommended ? "border-emerald-500/30 bg-emerald-950/10" : "border-gray-800 bg-gray-900"}`}
            >
              {item.isAiOption && (
                <div className="mb-3">
                  <span className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Option
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start mb-2 pr-28">
                <h3 className="font-bold text-lg text-gray-100 w-full">
                  <EditableField
                    value={item.title}
                    onChange={(val) =>
                      updateItem(section.id, item.id, "title", val)
                    }
                  />
                </h3>
              </div>

              <div className="text-sm text-gray-400 leading-relaxed pr-10 w-full">
                <EditableField
                  isTextArea
                  value={item.content}
                  onChange={(val) =>
                    updateItem(section.id, item.id, "content", val)
                  }
                />
              </div>

              {/* Item Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {apiKey && (
                  <button
                    onClick={() =>
                      triggerInlineAiAlternative(
                        section.id,
                        item.title,
                        item.content,
                      )
                    }
                    className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded bg-gray-950/50 transition-colors"
                    title="Generate Inline Alternative"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() =>
                    updateItem(
                      section.id,
                      item.id,
                      "isRecommended",
                      !item.isRecommended,
                    )
                  }
                  className={`p-1.5 rounded transition-colors ${item.isRecommended ? "text-emerald-400 bg-emerald-950 hover:bg-emerald-900/50" : "text-gray-500 bg-gray-950/50 hover:text-gray-300 hover:bg-gray-800"}`}
                  title="Toggle Recommended Status"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(section.id, item.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded bg-gray-950/50 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {!item.isAiOption && item.isRecommended && (
                <span className="absolute bottom-4 right-4 text-emerald-500/50 text-[10px] uppercase font-bold tracking-wider pointer-events-none">
                  Recommended
                </span>
              )}
            </div>
          ))}

          <button
            onClick={() => addItem(section.id)}
            className="w-full py-4 border-2 border-dashed border-gray-800 rounded-lg text-gray-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Feature / Component
          </button>
        </div>
      </div>
    );
  };

  const TitleIcon = AVAILABLE_ICONS[data.title.icon] || Settings;
  const currentModelData = availableModels.find(
    (m) => m.name === selectedModel,
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans flex md:flex-row selection:bg-emerald-900/50">
      {/* Hidden File Input for JSON Upload */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Sidebar Header */}
      <div className="w-48 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tighter text-gray-100 flex items-center gap-2">
            <button
              onClick={() =>
                setIconPicker({ isOpen: true, sectionId: "Title" })
              }
              className="p-2 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-800 rounded-xl text-emerald-500 transition-all shrink-0 shadow-sm"
              title="Change Icon"
            >
              <TitleIcon className="w-5 h-5" />
            </button>
            <EditableField
              className="max-w-[140px]"
              value={data.title.text}
              onChange={(val) =>
                setData({
                  ...data,
                  title: { ...data.title, text: val },
                })
              }
            />
          </h1>
          <div className="text-xs text-emerald-500/70 mt-1 font-mono break-all flex justify-between items-center">
            <EditableField
              value={data.version}
              onChange={(val) => setData({ ...data, version: val })}
            />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTabId("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTabId === "overview"
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            <Target className="w-4 h-4" /> Directive
          </button>

          <div className="my-2 border-b border-gray-800"></div>

          {data.sections.map((sec) => {
            const NavIcon = AVAILABLE_ICONS[sec.icon] || Settings;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTabId(sec.id)}
                className={`w-full flex justify-between items-center group px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTabId === sec.id
                    ? "bg-gray-800 text-gray-100"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3 truncate pr-2">
                  <NavIcon className="w-4 h-4" />
                  <span className="truncate">{sec.title}</span>
                </span>
              </button>
            );
          })}

          <button
            onClick={addSection}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          {apiKey && (
            <button
              onClick={triggerGeminiAudit}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/40 text-indigo-300 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg shadow-indigo-900/10"
            >
              <Sparkles className="w-4 h-4" /> Audit Project
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 text-gray-300 px-2 py-2 rounded-md font-medium text-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            <button
              onClick={exportJSON}
              className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-2 rounded-md font-medium text-xs transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>

          <button
            onClick={() => setShowApiModal(true)}
            className="w-full flex items-center justify-center gap-2 mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
          >
            <KeyRound className="w-3 h-3" /> Update API Key
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full h-screen">
        {/* Main Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-gray-950 relative">
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            {activeTabId === "overview"
              ? renderOverview()
              : data.sections.find((s) => s.id === activeTabId)
                ? renderSection(data.sections.find((s) => s.id === activeTabId))
                : null}
          </div>
        </div>
      </div>

      {/* API Key Request Modal */}
      {showApiModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
          onClick={() => setShowApiModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-visible flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/20 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">API & Model Settings</h2>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-visible flex-1 space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">
                  API Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key..."
                    className="w-full bg-black/40 border border-gray-700 rounded-2xl p-4 text-white focus:border-emerald-500 transition-all font-mono text-sm"
                  />
                </div>
                <div className="mt-3 flex justify-between items-center px-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1"
                  >
                    Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  {isFetchingModels && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Verifying
                      Key...
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Model Picker Dropdown */}
              {apiKey && (
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Select Model
                  </label>

                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-black/40 border border-gray-700 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500 focus:border-emerald-500 transition-all text-left group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="text-sm font-bold text-white truncate">
                        {currentModelData
                          ? currentModelData.displayName
                          : selectedModel}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                        {currentModelData
                          ? currentModelData.description
                          : "Custom or unrecognized model"}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 group-hover:text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu Popup */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-gray-800 bg-gray-800/50">
                        <div className="relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            value={modelSearch}
                            onChange={(e) => setModelSearch(e.target.value)}
                            placeholder="Search available models..."
                            className="w-full bg-black/40 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
                        {availableModels.length > 0 ? (
                          filteredModels.length > 0 ? (
                            filteredModels.map((m) => (
                              <button
                                key={m.name}
                                onClick={() => {
                                  setSelectedModel(m.name);
                                  setIsDropdownOpen(false);
                                  setModelSearch("");
                                }}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between mb-1 last:mb-0 group ${selectedModel === m.name ? "bg-emerald-500/10 border border-emerald-500/30" : "hover:bg-gray-800 border border-transparent"}`}
                              >
                                <div className="flex-1 pr-4">
                                  <div
                                    className={`text-sm font-bold flex items-center gap-2 ${selectedModel === m.name ? "text-emerald-400" : "text-gray-200 group-hover:text-white"}`}
                                  >
                                    {m.displayName}
                                  </div>
                                  <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                                    {m.description}
                                  </div>
                                </div>
                                {selectedModel === m.name && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="py-8 text-center text-gray-500 text-xs italic">
                              No models match your search.
                            </div>
                          )
                        ) : (
                          <div className="py-8 text-center text-gray-500 text-xs">
                            {isFetchingModels
                              ? "Loading models..."
                              : "Enter a valid API key to load models"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-800 bg-gray-800/20 flex justify-end gap-3 rounded-b-3xl mt-auto">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      {iconPicker.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setIconPicker({ isOpen: false, sectionId: null })}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h3 className="font-bold text-gray-100 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-emerald-500" /> Select
                Module Icon
              </h3>
              <button
                onClick={() =>
                  setIconPicker({ isOpen: false, sectionId: null })
                }
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-6 sm:grid-cols-8 gap-3 overflow-y-auto max-h-[60vh]">
              {Object.entries(AVAILABLE_ICONS).map(([key, IconComponent]) => (
                <button
                  key={key}
                  onClick={() => handleIconSelect(key)}
                  className="p-3 bg-gray-800 hover:bg-emerald-900/40 hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/50 rounded-lg flex flex-col items-center justify-center transition-colors group aspect-square"
                  title={key}
                >
                  <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gemini Result / Error Modal */}
      {geminiModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() =>
            setGeminiModal({
              isOpen: false,
              title: "",
              response: "",
              isLoading: false,
              error: "",
            })
          }
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 shrink-0">
              <h3
                className={`font-bold flex items-center gap-2 ${geminiModal.error ? "text-red-400" : "text-indigo-400"}`}
              >
                {geminiModal.title}
              </h3>
              <button
                onClick={() =>
                  setGeminiModal({
                    isOpen: false,
                    title: "",
                    response: "",
                    isLoading: false,
                    error: "",
                  })
                }
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {geminiModal.isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-indigo-400 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium animate-pulse">
                    Analyzing architecture...
                  </p>
                </div>
              ) : geminiModal.error ? (
                <div className="flex flex-col gap-2">
                  <div className="text-gray-300 text-sm leading-relaxed mb-4">
                    {geminiModal.response}
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-mono break-words">
                    {geminiModal.error}
                  </div>
                </div>
              ) : (
                <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {geminiModal.response}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-800 flex justify-end shrink-0">
              <button
                onClick={() =>
                  setGeminiModal({
                    isOpen: false,
                    title: "",
                    response: "",
                    isLoading: false,
                    error: "",
                  })
                }
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Target Icon SVG
function Target(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
