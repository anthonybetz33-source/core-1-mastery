import { useMemo, useState } from "react";
import { BookOpen, Calculator, Cable, Cpu, ExternalLink, Network, Search, Shuffle, ShieldCheck, Wrench, X } from "lucide-react";

const img = (file: string) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;
const src = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, "_")}`;

type Visual = {
  id: string;
  name: string;
  cat: string;
  sub?: string;
  image: string;
  purpose: string;
  recognize: string;
  trap: string;
  source: string;
};

const V = (id: string, name: string, cat: string, file: string, purpose: string, recognize: string, trap: string, sub?: string): Visual => ({
  id, name, cat, sub, image: img(file), purpose, recognize, trap, source: src(file),
});

/* Real photographs / reference images. The source button on every card points to the original Commons file. */
const VISUALS: Visual[] = [
  // Motherboards / internal hardware
  V("mb-atx", "ATX motherboard", "Motherboards", "Atx computer motherboard with cpu and fan.jpg", "Full-size desktop motherboard connecting CPU, RAM, storage, expansion cards and power.", "Large board with CPU socket, DIMM slots, chipset/heatsink areas, PCIe slots and headers.", "Form factor matters: an ATX board needs a compatible case and power arrangement.", "ATX"),
  V("mb-itx", "Mini-ITX motherboard", "Motherboards", "ITX Computer Mainboard ATOM CPU IMG 1859.JPG", "Compact motherboard for small-form-factor systems.", "Much smaller PCB with fewer expansion slots than ATX/microATX.", "Mini-ITX describes board size/form factor, not CPU architecture.", "Mini-ITX"),
  V("mb-pc", "Desktop motherboard", "Motherboards", "Computer-motherboard.jpg", "General desktop system board reference.", "Look for CPU socket, RAM slots, expansion slots, storage connectors and rear I/O.", "Do not identify a board from color alone; use the physical connectors and slots.", "Component map"),
  V("mb-exploded", "Exploded PC hardware", "Motherboards", "Personal computer, exploded 4.svg", "Visual map of major internal PC components.", "Motherboard, CPU, RAM, expansion cards, storage and PSU are separated for identification.", "On the exam, identify the component by its job and interface, not just where it sits.", "System overview"),
  V("slots-pci", "PCI + legacy riser slots", "Motherboards", "AMR and PCI slots.gk.jpg", "Reference for older expansion-slot families.", "PCI is a longer legacy expansion slot; riser-era slots have distinct shapes and positions.", "Do not confuse a legacy PCI slot with PCI Express x1/x4/x8/x16.", "Expansion slots"),
  V("psu", "ATX power supply", "Power", "ATX-Netzteil.jpg", "Converts AC input to regulated DC power for the PC.", "Metal PSU enclosure with bundled motherboard, CPU and peripheral power leads.", "Wattage alone is not enough; check connector type, rails and efficiency.", "PSU"),
  V("atx-power", "24-pin ATX + CPU power", "Power", "ATX Power connectors 24pin 8pin 4pin Motherboard.jpg", "Main motherboard power plus dedicated CPU/EPS power.", "Large 24-pin main connector alongside smaller 4/8-pin CPU connector.", "CPU EPS power is not the same thing as PCIe GPU power.", "Power connectors"),
  V("ram-dimms", "Desktop DIMM / RAM", "Memory", "Personal computer, exploded 4.svg", "Volatile working memory used by the CPU.", "Long memory modules installed into motherboard DIMM slots.", "DDR generations are keyed and electrically different; they are not interchangeable.", "DIMM"),

  // Expansion cards — exactly the kind of hardware the visual section was missing
  V("gpu-pcie", "PCIe graphics card", "Expansion cards", "Graphic card.jpg", "Dedicated GPU for graphics processing and display output.", "Long PCIe card with GPU cooling and a rear bracket containing display outputs.", "A GPU is normally installed in a PCIe x16 slot; slot length and electrical lanes are separate concepts.", "Video card"),
  V("gpu-legacy", "PCI Express video adapter", "Expansion cards", "PCI-E Video.jpg", "Older PCIe video adapter example for recognizing the card class.", "Full-length expansion card with video circuitry and a PCIe edge connector.", "Do not confuse PCIe with old PCI/AGP graphics interfaces.", "Video card"),
  V("gpu-output", "Graphics card outputs", "Expansion cards", "Video card Outputs.jpg", "Recognize common video-output combinations on expansion cards.", "Rear bracket showing multiple display connector types.", "The output connector tells you the interface leaving the GPU; it does not identify the PCIe slot.", "Video outputs"),
  V("gpu-msi", "Discrete graphics card", "Expansion cards", "Graphic card PCIe geforce560ti IMGP6415 wp.jpg", "Real-world discrete GPU with large cooler and PCIe interface.", "Large add-in card with heatsink/fans and external display bracket.", "High-end GPUs may need additional PCIe power connectors from the PSU.", "Discrete GPU"),
  V("gpu-agp", "Legacy AGP graphics card", "Expansion cards", "Graphics card 4.jpg", "Historical graphics adapter useful for distinguishing AGP from PCIe.", "Older graphics card with a different edge connector and board layout.", "AGP is legacy; do not select it when a scenario specifies PCI Express.", "Legacy GPU"),
  V("sound-pci", "PCI sound card", "Expansion cards", "PCIsoundcard.jpg", "Adds audio input/output and processing to a desktop.", "Expansion bracket with multiple 3.5 mm audio jacks; older card uses PCI.", "A sound card is an expansion device; onboard audio is integrated on the motherboard.", "Sound card"),
  V("sound-pci2", "PCI sound card — alternate", "Expansion cards", "Sound card.jpg", "Second physical example of a discrete sound card.", "Audio jacks and a legacy PCI edge connector on the card.", "Do not assume every sound card uses PCIe; identify the actual edge connector.", "Sound card"),
  V("sound-pcie", "PCIe sound card", "Expansion cards", "A photo of a Sound Blaster Z sound card.jpg", "Modern discrete audio expansion card using PCI Express.", "Shorter PCIe edge connector plus audio I/O bracket and shielding/components.", "PCIe x1 cards can fit the small x1 slot; do not call the slot a PCI slot.", "Sound card"),
  V("nic-pci", "PCI Ethernet NIC", "Expansion cards", "Ethernet Network interface Card RTL8139D PCI with displaced connector IMG 7306.jpg", "Adds wired Ethernet networking to a desktop.", "Expansion bracket with RJ45 Ethernet port and network controller circuitry.", "NIC means network interface controller/card; it is not a router or switch.", "Network card"),
  V("nic-gigabit", "Gigabit PCI NIC", "Expansion cards", "GB Network PCI Card.jpg", "Legacy PCI network interface for wired Ethernet.", "Single RJ45 port on a PCI expansion card.", "Do not confuse a NIC's RJ45 port with a telephone RJ11 jack.", "Network card"),
  V("nic-pcie", "PCIe network card", "Expansion cards", "3Com-Etherlink-Network-Interface-Card-01.jpg", "Expansion-card Ethernet interface for a desktop.", "Card has an edge connector and RJ45 network interface on its bracket.", "A network card connects a host to a network; routing between networks is a router function.", "Network card"),
  V("nic-wireless", "Wireless NIC", "Expansion cards", "Wireless network interface controller Gigabyte GC-WB867D-I - front and back - 2018-05-15.jpg", "Adds Wi-Fi/Bluetooth networking to a desktop.", "Small adapter board with radio components and antenna connectors.", "Wi-Fi capability is determined by the wireless adapter and standards, not simply by having an expansion slot.", "Wireless NIC"),
  V("pcie-card", "PCIe x4 add-in card", "Expansion cards", "PCIe card full height.jpg", "Example of a PCIe expansion card and full-height bracket.", "Long metal bracket plus PCIe edge connector; card length varies by function.", "PCIe x4 describes electrical/physical lane configuration, not a guarantee that every x4 card is identical in size.", "PCIe"),

  // Video / display connectors
  V("hdmi", "HDMI Type A", "Video / display", "HDMI-Connector.jpg", "Digital video and audio connection for displays, TVs and projectors.", "19-pin wide tapered connector.", "HDMI is digital and carries audio; VGA is analog and normally video-only.", "Video"),
  V("dp", "DisplayPort", "Video / display", "Displayport-cable.jpg", "Digital packet-based display interface common on PCs and monitors.", "Rectangular plug with one clipped corner; many full-size plugs latch.", "Do not yank a latching DisplayPort connector.", "Video"),
  V("dvi", "DVI", "Video / display", "Dvi-cable.jpg", "Legacy display interface with digital, analog or integrated variants.", "Large pin grid plus a flat blade.", "DVI-D is digital, DVI-A analog and DVI-I can carry both.", "Video"),
  V("vga", "VGA / DE-15", "Video / display", "Vga-cable.jpg", "Legacy analog video connection.", "15 contacts in three rows with screw posts.", "VGA is analog and does not carry audio.", "Video"),
  V("usbc-video", "USB-C video-capable connector", "Video / display", "USB Type-C.jpg", "Reversible connector that may carry USB data, charging and video depending on implementation.", "Small reversible oval-shaped connector.", "USB-C describes the connector shape, not a guaranteed speed, video mode or Thunderbolt feature.", "Video-capable USB-C"),

  // Networking / cabling
  V("rj11", "RJ11 telephone connector", "Networking / cabling", "Conector RJ11.jpg", "Telephone/DSL modular connection.", "Smaller modular plug than RJ45; telephone wiring uses fewer contacts in common installations.", "RJ11 is not the normal Ethernet connector.", "Copper"),
  V("rj45", "RJ45 / 8P8C Ethernet", "Networking / cabling", "RJ45 Ethernet Cable.jpg", "Twisted-pair Ethernet connection.", "Eight-position modular plug with locking tab.", "Know T568A vs T568B and the physical difference from RJ11.", "Copper"),
  V("f-type", "F-type coax connector", "Networking / cabling", "F Connector Side.jpg", "Threaded coaxial connection used for cable broadband/TV.", "Threaded cylindrical connector attached to coaxial cable.", "F-type is coax; RJ45 is twisted-pair Ethernet.", "Coax"),
  V("sc-fiber", "SC fiber connector", "Networking / cabling", "St-sc-fiber-connectors.jpg", "Fiber connector used in optical networking.", "Square push/pull connector.", "SC and ST use different locking mechanisms.", "Fiber"),
  V("lc-fiber", "LC fiber connector", "Networking / cabling", "Lc-sc-fiber-connectors.jpg", "Compact fiber connector used where high port density is useful.", "Small latch-style connector.", "LC is smaller than SC; do not identify it by cable color alone.", "Fiber"),
  V("st-fiber", "ST fiber connector", "Networking / cabling", "St-sc-fiber-connectors.jpg", "Bayonet-style fiber connector.", "Round connector using a twist/bayonet locking action.", "ST is not the same connector style as SC push/pull.", "Fiber"),
  V("usb-a", "USB Type-A", "Peripheral / USB", "USB-cable.jpg", "Common rectangular USB host/peripheral connector.", "Flat rectangular plug with contacts inside.", "Connector shape does not tell you whether the link is USB 2.0, 3.x or another protocol.", "USB"),
  V("micro-usb", "Micro-USB", "Peripheral / USB", "USB Micro-B.png", "Legacy mobile/peripheral USB connector.", "Small, tapered Micro-B shape.", "Micro-USB and USB-C are physically different interfaces.", "USB"),
  V("mini-usb", "Mini-USB", "Peripheral / USB", "Mini USB-Stecker.JPG", "Older USB connector used on cameras and peripherals.", "Chunkier trapezoidal Mini-B plug.", "Mini-USB is larger than Micro-USB.", "USB"),
  V("sata", "SATA data cable", "Storage / cabling", "SATA Cable (4816965007).jpg", "Serial ATA data connection for compatible storage.", "Thin keyed data cable with small L-shaped connector.", "SATA data and SATA power are separate connections.", "Storage"),
  V("molex", "Molex 4-pin power", "Power / cabling", "Molex.jpg", "Legacy peripheral power connector.", "Large rectangular 4-pin power plug.", "Molex is power; SATA data is a separate thin cable.", "Power"),

  // Technician tools
  V("crimper", "RJ45 crimper", "Technician tools", "Crimping tool TP2.jpg", "Terminates modular plugs onto twisted-pair cable.", "Hand tool with modular-plug cavity and handles.", "Crimper = modular plug; punchdown = IDC termination.", "Tools"),
  V("punchdown", "Punchdown tool", "Technician tools", "Punch-down-tool-Krone-and-110-0a.jpg", "Seats conductors into IDC terminals on keystones/patch panels.", "Slim hand tool designed to press individual conductors into slots.", "Do not use a punchdown tool to crimp an RJ45 plug.", "Tools"),
  V("tester", "Cable tester", "Technician tools", "Cabletester.jpg", "Checks continuity, opens, shorts and wiring/pinout faults.", "Tester body plus remote unit/port interface for cable testing.", "It verifies cable wiring; it does not prove that Internet service works.", "Test equipment"),
  V("meter", "Digital multimeter", "Technician tools", "All multimeters.jpg", "Measures voltage, resistance, current and other electrical quantities.", "Handheld meter with display, selector dial and test leads.", "Never measure resistance on an energized circuit.", "Test equipment"),
  V("router", "Router", "Networking hardware", "Router0002.jpg", "Routes packets between different IP networks.", "Multiple network interfaces and Layer-3 forwarding function.", "A switch forwards frames within a LAN; a router connects networks.", "Network device"),
  V("rack", "Ethernet switch + patch panels", "Networking hardware", "19-inch rackmount Ethernet switches and patch panels.jpg", "Structured network infrastructure for many endpoints.", "Rack-mounted switch with many ports beside/above patch-panel ports.", "Patch panels organize/terminate cabling; switches forward Ethernet frames.", "Network device"),
  V("patch", "Patch panel", "Networking hardware", "Patch Panel.jpg", "Central termination and organization point for structured cabling.", "Rows of labeled network ports/keystone positions.", "A patch panel does not replace a switch.", "Network device"),
];

const PORTS = [
  ["20/21", "FTP", "File Transfer Protocol", "TCP", "File transfer"], ["22", "SSH / SFTP", "Secure Shell / SSH File Transfer", "TCP", "Secure remote administration / file transfer"], ["23", "Telnet", "Remote terminal", "TCP", "Legacy unencrypted remote access"], ["25", "SMTP", "Simple Mail Transfer Protocol", "TCP", "Email transfer"], ["53", "DNS", "Domain Name System", "TCP/UDP", "Name resolution"], ["67/68", "DHCP", "Dynamic Host Configuration Protocol", "UDP", "Automatic IP configuration"], ["80", "HTTP", "Hypertext Transfer Protocol", "TCP", "Web traffic"], ["110", "POP3", "Post Office Protocol 3", "TCP", "Email retrieval"], ["123", "NTP", "Network Time Protocol", "UDP", "Time synchronization"], ["137-139", "NetBIOS/NetBT", "NetBIOS over TCP/IP", "TCP/UDP", "Legacy Windows networking"], ["143", "IMAP", "Internet Message Access Protocol", "TCP", "Email retrieval/synchronization"], ["389", "LDAP", "Lightweight Directory Access Protocol", "TCP/UDP", "Directory services"], ["443", "HTTPS", "HTTP Secure", "TCP", "Encrypted web traffic"], ["445", "SMB/CIFS", "Server Message Block", "TCP", "Windows file/printer sharing"], ["3389", "RDP", "Remote Desktop Protocol", "TCP/UDP", "Remote graphical desktop"],
];

const SUBNETS = [
  ["/8", "255.0.0.0", "16,777,214", "10.0.0.0/8 private"], ["/9", "255.128.0.0", "8,388,606", ""], ["/10", "255.192.0.0", "4,194,302", ""], ["/11", "255.224.0.0", "2,097,150", ""], ["/12", "255.240.0.0", "1,048,574", "172.16.0.0/12 private"], ["/13", "255.248.0.0", "524,286", ""], ["/14", "255.252.0.0", "262,142", ""], ["/15", "255.254.0.0", "131,070", ""], ["/16", "255.255.0.0", "65,534", "192.168.0.0/16 private"], ["/17", "255.255.128.0", "32,766", ""], ["/18", "255.255.192.0", "16,382", ""], ["/19", "255.255.224.0", "8,190", ""], ["/20", "255.255.240.0", "4,094", ""], ["/21", "255.255.248.0", "2,046", ""], ["/22", "255.255.252.0", "1,022", ""], ["/23", "255.255.254.0", "510", ""], ["/24", "255.255.255.0", "254", "Common LAN"], ["/25", "255.255.255.128", "126", "2 subnets per /24"], ["/26", "255.255.255.192", "62", "4 subnets per /24"], ["/27", "255.255.255.224", "30", "8 subnets per /24"], ["/28", "255.255.255.240", "14", "16 subnets per /24"], ["/29", "255.255.255.248", "6", "32 subnets per /24"], ["/30", "255.255.255.252", "2", "Point-to-point"], ["/31", "255.255.255.254", "2*", "Special point-to-point use"], ["/32", "255.255.255.255", "1", "Single-host route"],
];

const ADDRESSES = [
  ["10.24.8.15", "Private", "10.0.0.0/8"], ["172.20.4.9", "Private", "172.16.0.0/12"], ["192.168.1.44", "Private", "192.168.0.0/16"], ["169.254.22.8", "APIPA/link-local", "No DHCP lease"], ["127.0.0.1", "IPv4 loopback", "Local host"], ["8.8.8.8", "Public IPv4", "Globally routable example"], ["192.168.300.1", "INVALID", "Octet 300 is outside 0-255"], ["10.0.0.999", "INVALID", "Octet 999 is outside 0-255"], ["196.293.909.1", "INVALID", "293 and 909 are outside 0-255"], ["::1", "IPv6 loopback", "Local host"], ["fe80::1", "IPv6 link-local", "FE80::/10"],
];

const RESOURCES = [
  ["Professor Messer — 220-1201 free course", "63 free videos covering the official Core 1 objectives.", "https://www.professormesser.com/free-a-plus-training/220-1201/220-1201-video/220-1201-training-course/"],
  ["Professor Messer — Core 1 study groups", "Monthly Q&A replays and exam-focused discussion.", "https://www.professormesser.com/category/free-a-plus-training/220-1201/220-1201-study-group/"],
  ["Professor Messer — Core 1 resources", "Official page for free and premium 220-1201 study materials.", "https://www.professormesser.com/get-a-plus-core-1-certified/"],
  ["CompTIA A+ Core 1", "Official certification and objective information.", "https://www.comptia.org/certifications/a/core-1-v15"],
];

const CATS = ["All", "Motherboards", "Expansion cards", "Memory", "Video / display", "Networking / cabling", "Networking hardware", "Peripheral / USB", "Storage / cabling", "Power / cabling", "Technician tools"];
type Tab = "visuals" | "ports" | "ip" | "resources";

export function ToolsLabView() {
  const [tab, setTab] = useState<Tab>("visuals");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Visual | null>(null);
  const [quiz, setQuiz] = useState<Visual | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [portQ, setPortQ] = useState("");
  const [ipQ, setIpQ] = useState("");

  const shown = useMemo(() => VISUALS.filter(x => (cat === "All" || x.cat === cat) && (!q || `${x.name} ${x.cat} ${x.sub ?? ""} ${x.purpose} ${x.recognize} ${x.trap}`.toLowerCase().includes(q.toLowerCase()))), [q, cat]);
  const ports = useMemo(() => PORTS.filter(x => !portQ || x.join(" ").toLowerCase().includes(portQ.toLowerCase())), [portQ]);
  const addresses = useMemo(() => ADDRESSES.filter(x => !ipQ || x.join(" ").toLowerCase().includes(ipQ.toLowerCase())), [ipQ]);

  const start = () => {
    const pool = shown.length ? shown : VISUALS;
    setQuiz(pool[Math.floor(Math.random() * pool.length)]);
    setAnswer(null);
  };
  const next = () => {
    const pool = (shown.length ? shown : VISUALS).filter(x => x.id !== quiz?.id);
    setQuiz(pool[Math.floor(Math.random() * pool.length)] ?? VISUALS[0]);
    setAnswer(null);
  };

  return (
    <div className="pb-8">
      <header className="rounded-3xl border border-border bg-panel p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-accent"><Wrench className="h-4 w-4" />Core 1 Technician Lab</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">See the hardware. Know the hardware.</h1>
            <p className="mt-2 max-w-3xl text-muted">Real reference photos for motherboards, GPUs, sound cards, NICs, connectors, cables and technician tools — plus the ports, subnet and IP charts you actually need.</p>
          </div>
          <button onClick={start} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-semibold text-white"><Shuffle className="h-4 w-4" />Visual ID drill</button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([['visuals', 'Visual hardware', Cpu], ['ports', 'Ports & protocols', Network], ['ip', 'IP + subnet', Calculator], ['resources', 'Study resources', BookOpen]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold ${tab === id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-bg text-muted'}`}><Icon className="mr-2 inline h-4 w-4" />{label}</button>
          ))}
        </div>
      </header>

      {tab === "visuals" && (
        <section className="mt-5">
          <div className="rounded-3xl border border-border bg-panel p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search HDMI, motherboard, GPU, NIC, crimper…" className="h-12 w-full rounded-2xl border border-border bg-bg pl-11 pr-4 outline-none focus:border-accent" /></label>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[65%]">
                {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${cat === c ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-bg text-muted'}`}>{c}</button>)}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted"><span>{shown.length} real visual references</span><span>Tap a card to study it</span></div>
          </div>

          {shown.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-border bg-panel p-10 text-center text-muted">No visual matches. Try another search or switch categories.</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map(v => (
                <button key={v.id} onClick={() => setOpen(v)} className="group overflow-hidden rounded-3xl border border-border bg-panel text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white">
                    <img src={v.image} alt={v.name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]" />
                    <div className="absolute left-3 top-3 rounded-lg bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{v.cat}</div>
                  </div>
                  <div className="p-4"><div className="text-lg font-semibold">{v.name}</div><div className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">{v.sub ?? 'Core 1 recognition'}</div><p className="mt-2 line-clamp-2 text-sm text-muted">{v.purpose}</p><div className="mt-4 flex items-center justify-between text-xs font-semibold"><span className="text-muted">IDENTIFY → LEARN → APPLY</span><ExternalLink className="h-4 w-4 text-muted" /></div></div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "ports" && <section className="mt-5 rounded-3xl border border-border bg-panel p-4 sm:p-6"><div className="flex items-center gap-2"><Network className="h-5 w-5 text-accent" /><h2 className="text-xl font-semibold">Ports & protocols</h2></div><p className="mt-1 text-sm text-muted">Core 1 recognition table, with NTP included as a useful current reference.</p><input value={portQ} onChange={e => setPortQ(e.target.value)} placeholder="Search port, protocol, transport…" className="mt-4 h-11 w-full rounded-2xl border border-border bg-bg px-4 outline-none focus:border-accent" /><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted"><th className="p-3">Port</th><th className="p-3">Protocol</th><th className="p-3">Name</th><th className="p-3">Transport</th><th className="p-3">Use</th></tr></thead><tbody>{ports.map((r, i) => <tr key={i} className="border-b border-border/70"><td className="p-3 font-mono font-bold text-accent">{r[0]}</td><td className="p-3 font-semibold">{r[1]}</td><td className="p-3 text-muted">{r[2]}</td><td className="p-3">{r[3]}</td><td className="p-3 text-muted">{r[4]}</td></tr>)}</tbody></table></div></section>}

      {tab === "ip" && <section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-border bg-panel p-4 sm:p-6"><div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-accent" /><h2 className="text-xl font-semibold">CIDR → subnet mask → hosts</h2></div><p className="mt-1 text-sm text-muted">Usable IPv4 hosts for standard subnetting questions.</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted"><th className="p-3">CIDR</th><th className="p-3">Mask</th><th className="p-3">Usable hosts</th><th className="p-3">Note</th></tr></thead><tbody>{SUBNETS.map((r, i) => <tr key={i} className="border-b border-border/70"><td className="p-3 font-mono font-bold text-accent">{r[0]}</td><td className="p-3 font-mono">{r[1]}</td><td className="p-3 font-semibold">{r[2]}</td><td className="p-3 text-muted">{r[3]}</td></tr>)}</tbody></table></div></div><div className="rounded-3xl border border-border bg-panel p-4 sm:p-6"><h2 className="text-xl font-semibold">IPv4 / IPv6 recognition</h2><p className="mt-1 text-sm text-muted">The invalid examples are intentional: an IPv4 octet can only be 0–255.</p><input value={ipQ} onChange={e => setIpQ(e.target.value)} placeholder="Search 192.168, APIPA, invalid…" className="mt-4 h-11 w-full rounded-2xl border border-border bg-bg px-4 outline-none focus:border-accent" /><div className="mt-4 space-y-2">{addresses.map((r, i) => <div key={i} className="rounded-2xl border border-border bg-bg p-3"><div className="flex items-center justify-between gap-3"><span className="font-mono font-bold">{r[0]}</span><span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${r[1] === 'INVALID' ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>{r[1]}</span></div><div className="mt-1 text-xs text-muted">{r[2]}</div></div>)}</div></div></section>}

      {tab === "resources" && <section className="mt-5 grid gap-4 sm:grid-cols-2">{RESOURCES.map(([title, desc, url]) => <a key={title} href={url} target="_blank" rel="noreferrer" className="rounded-3xl border border-border bg-panel p-5 transition hover:border-accent/50"><div className="flex items-start justify-between gap-4"><div><div className="text-lg font-semibold">{title}</div><p className="mt-2 text-sm text-muted">{desc}</p></div><ExternalLink className="h-5 w-5 shrink-0 text-accent" /></div></a>)}<div className="sm:col-span-2 rounded-3xl border border-accent/20 bg-accent/5 p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><div className="font-semibold">Use this lab as the visual layer — not as a replacement for the objectives.</div><p className="mt-1 text-sm text-muted">The visual library is designed to reinforce recognition. Your exam prep should still be driven by the official 220-1201 objectives and scenario practice.</p></div></div></div></section>}

      {quiz && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setQuiz(null)}><div className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-panel shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between border-b border-border p-4"><div><div className="text-xs font-bold uppercase tracking-wider text-accent">Visual ID drill</div><div className="text-sm text-muted">What are you looking at?</div></div><button onClick={() => setQuiz(null)} className="rounded-xl p-2 hover:bg-bg"><X className="h-5 w-5" /></button></div><div className="bg-white p-4"><img src={quiz.image} alt={quiz.name} className="mx-auto h-56 w-full object-contain" /></div><div className="p-5"><div className="grid grid-cols-2 gap-2">{[quiz.name, ...VISUALS.filter(v => v.id !== quiz.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.name)].sort(() => Math.random() - 0.5).map(choice => <button key={choice} onClick={() => setAnswer(choice)} className={`rounded-2xl border p-3 text-left text-sm font-semibold ${answer === choice ? choice === quiz.name ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10' : 'border-border bg-bg'}`}>{choice}</button>)}</div>{answer && <div className="mt-4 rounded-2xl border border-border bg-bg p-4"><div className="font-semibold">{answer === quiz.name ? 'Correct.' : `Not quite — this is ${quiz.name}.`}</div><p className="mt-1 text-sm text-muted">{quiz.recognize}</p>{answer !== quiz.name && <p className="mt-2 text-sm text-muted"><strong>Exam trap:</strong> {quiz.trap}</p>}<button onClick={next} className="mt-4 min-h-11 rounded-xl bg-accent px-4 font-semibold text-white">Next visual</button></div>}</div></div></div>}

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(null)}><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-panel shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between border-b border-border p-4"><div><div className="text-xs font-bold uppercase tracking-wider text-accent">{open.cat} · {open.sub ?? 'Core 1 visual'}</div><h2 className="text-2xl font-semibold">{open.name}</h2></div><button onClick={() => setOpen(null)} className="rounded-xl p-2 hover:bg-bg"><X className="h-5 w-5" /></button></div><div className="bg-white p-4 sm:p-6"><img src={open.image} alt={open.name} className="mx-auto max-h-[46vh] w-full object-contain" /></div><div className="grid gap-3 p-5 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-bg p-4 sm:col-span-2"><div className="text-xs font-bold uppercase tracking-wider text-accent">What it does</div><p className="mt-1 text-sm">{open.purpose}</p></div><div className="rounded-2xl border border-border bg-bg p-4"><div className="text-xs font-bold uppercase tracking-wider text-accent">How to recognize</div><p className="mt-1 text-sm">{open.recognize}</p></div><div className="rounded-2xl border border-border bg-bg p-4 sm:col-span-3"><div className="text-xs font-bold uppercase tracking-wider text-accent">Exam trap / technician tip</div><p className="mt-1 text-sm">{open.trap}</p></div><a href={open.source} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-bg px-4 text-sm font-semibold text-muted sm:col-span-3"><ExternalLink className="h-4 w-4" />Open original image / attribution</a></div></div></div>}
    </div>
  );
}
