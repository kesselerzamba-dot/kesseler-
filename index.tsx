import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { 
  Search, 
  Github, 
  Star, 
  GitFork, 
  Users, 
  BookOpen, 
  ExternalLink, 
  Cpu, 
  Loader2,
  Code2,
  ChevronRight,
  HelpCircle,
  X,
  Copy,
  Check
} from 'lucide-react';

// --- Types ---
interface GithubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string;
}

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  updated_at: string;
}

// --- App Component ---
const App = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchGithubData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setAiSummary(null);

    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      if (!userRes.ok) throw new Error('User not found');
      const userData = await userRes.json();
      setUser(userData);

      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
      const reposData = await reposRes.json();
      setRepos(reposData);
      
      analyzeWithAI(userData, reposData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async (userData: GithubUser, repoData: Repository[]) => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const repoNames = repoData.map(r => r.name).join(', ');
      const languages = Array.from(new Set(repoData.map(r => r.language).filter(Boolean))).join(', ');
      
      const prompt = `Based on this GitHub profile, create a professional and punchy summary (max 3 sentences) in Portuguese. 
      Name: ${userData.name || userData.login}
      Bio: ${userData.bio || 'No bio'}
      Tech Stack based on repos: ${languages}
      Recent projects: ${repoNames}
      Format: A brief developer personality profile.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiSummary(response.text || "Análise concluída.");
    } catch (err) {
      setAiSummary("O Gemini não pôde analisar este perfil agora.");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Help Button */}
      <button 
        onClick={() => setShowGuide(true)}
        className="fixed top-6 right-6 p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all shadow-xl z-50 border border-slate-700"
        title="Como enviar para o GitHub?"
      >
        <HelpCircle size={24} />
      </button>

      {/* Header & Search */}
      <header className="mb-12 text-center pt-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-500/20">
            <Github size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            GitMind Explorer
          </h1>
        </div>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Analise perfis do GitHub com o poder da Inteligência Artificial do Google Gemini.
        </p>

        <form onSubmit={fetchGithubData} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username do GitHub..."
            className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all pr-16 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 p-3 bg-violet-600 hover:bg-violet-500 rounded-full text-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
          </button>
        </form>
      </header>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Github size={20} className="text-violet-400" />
                Como enviar para o seu GitHub
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="font-semibold text-white mb-2">1. Crie o Repositório</h4>
                <p className="text-slate-400 text-sm">Vá em <a href="https://github.com/new" target="_blank" className="text-violet-400 underline">github.com/new</a> e crie um repositório vazio.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">2. Copie os Arquivos</h4>
                <p className="text-slate-400 text-sm mb-4">Certifique-se de salvar o <b>index.tsx</b>, <b>index.html</b>, <b>package.json</b> e <b>README.md</b> na sua pasta local.</p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">3. Comandos de Terminal</h4>
                <div className="bg-black rounded-xl p-4 font-mono text-sm text-green-400 relative group">
                  <div className="space-y-1">
                    <p>git init</p>
                    <p>git add .</p>
                    <p>git commit -m "Initial commit"</p>
                    <p>git branch -M main</p>
                    <p>git remote add origin https://github.com/SEU_USER/NOME_REPO.git</p>
                    <p>git push -u origin main</p>
                  </div>
                  <button 
                    onClick={() => copyCommand('git init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit remote add origin https://github.com/SEU_USER/NOME_REPO.git\ngit push -u origin main')}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-violet-600/10 border border-violet-500/30 rounded-xl">
                <p className="text-sm text-violet-200">
                  <b>Dica:</b> Para o deploy, use a <b>Vercel</b> ou <b>Netlify</b>. Basta conectar seu repositório do GitHub e eles cuidarão de tudo!
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/30 text-center">
              <button 
                onClick={() => setShowGuide(false)}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full font-medium transition-all"
              >
                Entendi!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (User results, etc.) */}
      {error && (
        <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-2xl animate-fade-in text-red-200">
          Ops! Usuário não encontrado ou erro na API.
        </div>
      )}

      {user && (
        <div className="space-y-8 animate-fade-in">
          {/* Profile Card */}
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            <img 
              src={user.avatar_url} 
              alt={user.login} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-slate-800 shadow-2xl"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{user.name || user.login}</h2>
                  <p className="text-violet-400 font-medium">@{user.login}</p>
                </div>
                <a 
                  href={user.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors"
                >
                  GitHub <ExternalLink size={14} />
                </a>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 italic">
                {user.bio || "Este desenvolvedor é um mistério (sem bio)."}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1 uppercase tracking-wider font-bold">
                    <BookOpen size={10} /> Repos
                  </div>
                  <div className="font-bold text-lg">{user.public_repos}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1 uppercase tracking-wider font-bold">
                    <Users size={10} /> Seguidores
                  </div>
                  <div className="font-bold text-lg">{user.followers}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1 uppercase tracking-wider font-bold">
                    <Star size={10} /> Projetos
                  </div>
                  <div className="font-bold text-lg">Top 6</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1 uppercase tracking-wider font-bold">
                    <Code2 size={10} /> Status
                  </div>
                  <div className="font-bold text-lg text-green-400">Ativo</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-violet-600/20 via-slate-900 to-cyan-600/20 border border-violet-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Cpu size={120} />
            </div>
            <div className="flex items-center gap-2 mb-4 text-violet-300 font-semibold uppercase tracking-wider text-xs">
              <Cpu size={16} />
              Análise Gemini AI
            </div>
            {analyzing ? (
              <div className="flex items-center gap-3 text-slate-400 italic py-4">
                <Loader2 className="animate-spin text-violet-500" size={24} />
                Processando insights do perfil...
              </div>
            ) : (
              <p className="text-xl text-slate-100 font-medium leading-relaxed italic relative z-10">
                "{aiSummary}"
              </p>
            )}
          </div>

          {/* Repositories */}
          <section>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Projetos Recentes <ChevronRight size={20} className="text-violet-500" />
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {repos.map(repo => (
                <a 
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card glow-hover rounded-2xl p-6 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg group-hover:text-violet-400 transition-colors">
                      {repo.name}
                    </h4>
                    <ExternalLink size={16} className="text-slate-600 group-hover:text-violet-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">
                    {repo.description || "Sem descrição."}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                      {repo.language || 'Code'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={14} />
                      {repo.forks_count}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Empty State */}
      {!user && !loading && !error && (
        <div className="mt-20 flex flex-col items-center opacity-20 grayscale select-none">
          <Github size={120} />
          <p className="mt-4 text-xl font-medium tracking-widest uppercase">GitMind Explorer</p>
        </div>
      )}
    </div>
  );
};

// --- Render ---
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}