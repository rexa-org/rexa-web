import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBookOpen, FiCpu, FiShield, FiTrendingUp, FiLayers, 
  FiCode, FiExternalLink, FiKey, FiTerminal, FiDatabase, FiSettings 
} from 'react-icons/fi';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const Documentation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const docSections: DocSection[] = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: <FiBookOpen className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Introduction to reXa</h3>
          <p className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
            reXa is a next-generation decentralized voucher swapping ledger and point management system. The platform allows users to digitize standard coupon sheets, securely swap vouchers utilizing point compensation offsets, and build reputation ratings via check-in interactions.
          </p>
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
            <h4 className="font-extrabold text-sm text-cyan-600 dark:text-cyan-400 flex items-center gap-2 mb-1.5">
              <FiShield /> Trust-Assured Trading
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every action on reXa is tracked through cryptographic state transitions, preventing duplicate code redemptions and ensuring high transaction integrity through automated trust score assessments.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ocr',
      title: 'AI OCR Coupon Manager',
      icon: <FiCpu className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Intelligent Voucher Extraction</h3>
          <p className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
            Using advanced multimodal vision models, the Coupon Manager processes uploaded images, extracts codes, sets category parameters, parses dates, and outputs editable metadata drafts instantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-cyan-500 tracking-wider">Step 1: Upload</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Provide screenshots or scans of voucher codes.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-cyan-500 tracking-wider">Step 2: Deploy</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review the AI parsing blocks, edit fields, and publish listings.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'trust',
      title: 'Trust Score Rating',
      icon: <FiShield className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Peer Trust Mechanism</h3>
          <p className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
            The reXa trust framework enforces positive-sum behavior among marketplace participants.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-550 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
              <span><strong>Check-in routines:</strong> Regular daily claims build continuous reputation scores.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
              <span><strong>Swap integrity:</strong> Disputing a trade or reporting expired codes affects publisher trust metrics.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
              <span><strong>Security threshold:</strong> Users below 60% trust rating are locked from batch listings.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'swaps',
      title: 'Exchange Swaps Ledger',
      icon: <FiTrendingUp className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Point Compensated Swapping</h3>
          <p className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
            Instead of standard binary buys, reXa supports asset-for-asset trades. If a proposed voucher has lower points valuation, the proposer can append point compensation offsets.
          </p>
          <div className="p-4 bg-slate-950 text-slate-300 rounded-2xl border border-slate-800 font-mono text-[11px] leading-relaxed space-y-1">
            <p className="text-cyan-400 font-bold"># Swapping Math Logic</p>
            <p>Target Voucher: "Gaming Code" (Valued 500 PTS)</p>
            <p>Proposed Voucher: "Shopping Coupon" (Valued 350 PTS)</p>
            <p>Required Point Compensation Offset: +150 PTS</p>
            <p className="text-emerald-400">Result: Atomic swap executed upon acceptance, codes decrypted.</p>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'Developer APIs',
      icon: <FiCode className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">API Integration Details</h3>
            <p className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed mt-1">
              Connect external client platforms to register vouchers and automate swaps via REST endpoints.
            </p>
          </div>

          <div className="space-y-4">
            {/* API Block 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase rounded">POST</span>
                <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">/api/rewards</code>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deploy a new voucher listing inside the database ledger.</p>
              <pre className="bg-slate-950 p-4 rounded-2xl text-[11px] font-mono text-cyan-400 border border-slate-800 overflow-x-auto shadow-inner">
{`{
  "title": "Amazon $25 Gift Card",
  "points": 250,
  "code": "AMZN-25-SAMPLE",
  "category": "Shopping",
  "expiryDate": "2026-12-31"
}`}
              </pre>
            </div>

            {/* API Block 2 */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase rounded">POST</span>
                <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">/api/requests/:id/respond</code>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Respond to proposed swap requests (accept or reject atomic trades).</p>
              <pre className="bg-slate-950 p-4 rounded-2xl text-[11px] font-mono text-cyan-400 border border-slate-800 overflow-x-auto shadow-inner">
{`{
  "status": "accepted" // or "rejected"
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeDoc = docSections.find(s => s.id === activeTab) || docSections[0];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20 text-slate-800 dark:text-slate-100 flex justify-center items-start">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">
        
        {/* Left Nav menu panel */}
        <aside className="md:w-3/12 flex-shrink-0 space-y-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white">
              <FiTerminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">reXa Docs</h1>
              <p className="text-[10px] text-slate-400 font-bold">API & Platform Specs</p>
            </div>
          </div>

          <nav className="bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200/50 dark:border-slate-850 p-3 rounded-3xl space-y-1">
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative ${
                  activeTab === section.id
                    ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 border border-cyan-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </nav>

          <div className="bg-slate-950 text-slate-400 p-4 rounded-3xl border border-slate-850 space-y-3 shadow-md">
            <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest flex items-center gap-2">
              <FiDatabase /> Git Repository
            </h4>
            <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
              Explore backend architecture templates and database seed blueprints.
            </p>
            <a 
              href="https://github.com/sreecharan-desu/reX" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition group"
            >
              <span>sreecharan-desu/reX</span>
              <FiExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            </a>
          </div>
        </aside>

        {/* Right content view area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDoc.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-850 shadow-xl min-h-[400px]"
            >
              {activeDoc.content}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default Documentation;
