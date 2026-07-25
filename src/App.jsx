import { useState, useEffect, useRef, useCallback, Component } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#06101c", surf:"#0b1828", card:"#0f2035", card2:"#132845",
  border:"#183858", accent:"#22aaee", accentDim:"#22aaee18",
  green:"#1fd97a", greenDim:"#1fd97a18",
  red:"#f0495a",   redDim:"#f0495a18",
  yellow:"#f5c442",yellowDim:"#f5c44218",
  purple:"#a855f7",purpleDim:"#a855f718",
  orange:"#f07a30",orangeDim:"#f07a3018",
  cyan:"#06d6c4",  cyanDim:"#06d6c418",
  text:"#cee4f4",  muted:"#4a7090",  dim:"#183858",
  legacy:"#f07a30",
};
const tierClr = t=>({critical:T.red,high:T.orange,medium:T.yellow,low:T.muted}[t]||T.muted);
const tierBg  = t=>({critical:T.redDim,high:T.orangeDim,medium:T.yellowDim,low:"#ffffff08"}[t]||"#ffffff08");
const osClr   = o=>({win:T.accent,linux:T.green,both:T.yellow,ps:T.purple,mac:"#aaaaaa"}[o]||T.muted);
const osLabel = o=>({win:"🪟 Win",linux:"🐧 Linux",both:"🔄 Both",ps:"💙 PS",mac:"🍎 Mac"}[o]||o);

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Tag=({tier})=>{
  const labels={critical:"★★★★★ CRITICAL",high:"★★★★ HIGH",medium:"★★★ MED",low:"★★ LOW"};
  return <span style={{background:tierBg(tier),color:tierClr(tier),border:`1px solid ${tierClr(tier)}50`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700,letterSpacing:0.3,whiteSpace:"nowrap"}}>{labels[tier]}</span>;
};
const OSTag=({os})=><span style={{background:osClr(os)+"20",color:osClr(os),border:`1px solid ${osClr(os)}40`,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{osLabel(os)}</span>;
const LegacyTag=()=><span style={{background:T.orangeDim,color:T.orange,border:`1px solid ${T.orange}50`,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>⚠️ LEGACY</span>;
const Card=({ch,style,left})=><div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",borderLeft:left?`3px solid ${left}`:undefined,...style}}>{ch}</div>;
const Sec=({title,color,children})=><div style={{marginBottom:14}}><div style={{color:color||T.accent,fontFamily:"monospace",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${T.border}`}}>{title}</div>{children}</div>;
const Pill=({children,color})=><span style={{background:color+"20",color,border:`1px solid ${color}40`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600}}>{children}</span>;
const DomainBanner=({exam,domain,note})=>{
  const colors={core1:{c:T.accent,bg:T.accentDim,label:"THIS TAB IS CORE 1"},core2:{c:T.purple,bg:T.purpleDim,label:"THIS TAB IS CORE 2"},both:{c:T.green,bg:T.greenDim,label:"THIS TAB COVERS BOTH EXAMS"}};
  const cfg=colors[exam];
  return(
    <div style={{padding:"9px 12px",background:cfg.bg,border:`1px solid ${cfg.c}40`,borderRadius:8,marginBottom:10}}>
      <span style={{color:cfg.c,fontWeight:800,fontSize:10.5,letterSpacing:0.5}}>📍 {cfg.label}</span>
      <span style={{color:T.muted,fontSize:11,marginLeft:6}}>({domain}){note?` — ${note}`:""}</span>
    </div>
  );
};

function Tabs({tabs,active,setActive,color}){
  return <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
    {tabs.map(t=><button key={t.id} onClick={()=>setActive(t.id)} style={{padding:"5px 13px",borderRadius:6,border:`1px solid ${active===t.id?(color||T.accent):T.border}`,background:active===t.id?(color||T.accent)+"20":"transparent",color:active===t.id?(color||T.accent):T.muted,cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0}}>{t.label}</button>)}
  </div>;
}
function GroupedTabs({tabs,active,setActive,color}){
  const groups=[...new Set(tabs.map(t=>t.group||"Other"))];
  return <div style={{marginBottom:14}}>
    {groups.map(g=>(
      <div key={g} style={{marginBottom:6}}>
        <div style={{fontSize:9,fontWeight:800,letterSpacing:1,color:T.dim,textTransform:"uppercase",marginBottom:3,paddingLeft:2}}>{g}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {tabs.filter(t=>(t.group||"Other")===g).map(t=>(
            <button key={t.id} onClick={()=>setActive(t.id)} style={{padding:"5px 13px",borderRadius:6,border:`1px solid ${active===t.id?(color||T.accent):T.border}`,background:active===t.id?(color||T.accent)+"20":"transparent",color:active===t.id?(color||T.accent):T.muted,cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0}}>{t.label}</button>
          ))}
        </div>
      </div>
    ))}
  </div>;
}
function Search({value,onChange,placeholder}){
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search…"} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surf,color:T.text,fontSize:11,outline:"none",width:"100%",maxWidth:220}}/>;
}

// ─── ALL DATA ─────────────────────────────────────────────────────────────────

// CORE EXAM INFO (corrected)
const EXAM_INFO = {
  core1:{code:"220-1201",name:"Core 1",pass:675,scale:900,questions:90,time:90,topics:"Mobile Devices, Networking, Hardware, Virtualization & Cloud Computing, Hardware & Network Troubleshooting"},
  core2:{code:"220-1202",name:"Core 2",pass:700,scale:900,questions:90,time:90,topics:"Operating Systems, Security, Software Troubleshooting, Operational Procedures"},
  launched:"March 25, 2025",retires:"~2028 (~3 years after launch)",cost:"$274 per exam (~$548 combined) — price rose from $265 on June 1, 2026",
  domains1:[["Mobile Devices","13%"],["Networking","23%"],["Hardware","25%"],["Virtualization & Cloud","11%"],["HW & Network Troubleshooting","28%"]],
  domains2:[["Operating Systems","28%"],["Security","28%"],["Software Troubleshooting","23%"],["Operational Procedures","21%"]],
};

const PORTS=[
  {port:20,proto:"TCP",svc:"FTP Data",desc:"File transfer DATA channel (active mode). Passive mode uses ephemeral ports.",tier:"critical",alt:"—",examTip:"In active mode the SERVER opens 20 to push data to client. In passive mode (PASV) the server tells the client a random high port to connect to instead — important for firewall/NAT scenarios."},
  {port:21,proto:"TCP",svc:"FTP Control",desc:"File transfer commands and control channel.",tier:"critical",alt:"—",examTip:"Control connection (21) stays open for the whole session; data connection (20 or PASV port) opens/closes per file. Username/password sent in PLAINTEXT — use SFTP/FTPS for security."},
  {port:22,proto:"TCP",svc:"SSH / SFTP",desc:"Secure Shell remote access AND Secure File Transfer Protocol.",tier:"critical",alt:"—",examTip:"SSH replaced Telnet for remote CLI access. SFTP (SSH File Transfer Protocol) is NOT the same as FTPS — SFTP tunnels file transfer through SSH on a single port 22."},
  {port:23,proto:"TCP",svc:"Telnet",desc:"Unencrypted remote terminal. Sends all data in plaintext.",tier:"high",alt:"—",legacy:true,examTip:"Still appears on exams as a 'what's wrong with this setup' scenario. Correct answer is almost always 'replace with SSH'."},
  {port:25,proto:"TCP",svc:"SMTP",desc:"Sending email between mail servers (server-to-server).",tier:"critical",alt:"587, 465",examTip:"Many ISPs block outbound port 25 by default to fight spam — this is why port 587 (submission) exists for end users sending mail through their provider."},
  {port:53,proto:"UDP/TCP",svc:"DNS",desc:"UDP for queries, TCP for zone transfers and large responses (>512 bytes).",tier:"critical",alt:"5353 (mDNS)",examTip:"A classic exam trap: a firewall that only allows UDP/53 will silently break large DNS responses and ALL zone transfers, since those require TCP/53."},
  {port:67,proto:"UDP",svc:"DHCP Server",desc:"Server listens here and assigns IP addresses to clients.",tier:"high",alt:"—",examTip:"DHCP uses the DORA process: Discover, Offer, Request, Acknowledge — all four messages move between ports 67 and 68."},
  {port:68,proto:"UDP",svc:"DHCP Client",desc:"Client sends requests FROM port 68 TO port 67.",tier:"high",alt:"—",examTip:"Remember server=67 (lower number, listens), client=68 (higher number, requests) — alphabetical/numerical order matches role order."},
  {port:69,proto:"UDP",svc:"TFTP",desc:"Trivial File Transfer Protocol — simplified FTP with NO authentication, NO directory listing.",tier:"medium",alt:"—",examTip:"Used heavily for network device firmware/config transfers (routers, switches, PXE boot). No login required — major security consideration."},
  {port:80,proto:"TCP",svc:"HTTP",desc:"Unencrypted web traffic. All data visible to attackers.",tier:"critical",alt:"8080, 8000",examTip:"Browsers show 'Not Secure' for HTTP sites. Forms submitted over HTTP (including login forms) can be intercepted via packet sniffing or MITM attacks."},
  {port:110,proto:"TCP",svc:"POP3",desc:"Downloads email from server AND deletes it from server.",tier:"high",alt:"995 (secure)",examTip:"POP3 has a 'leave a copy on server' option in most clients, but the DEFAULT and traditional behavior is delete-after-download — this is the key exam distinction vs IMAP."},
  {port:123,proto:"UDP",svc:"NTP",desc:"Network Time Protocol — synchronizes clock time across devices on a network.",tier:"medium",alt:"—",examTip:"Accurate time matters for Kerberos authentication (AD), certificate validation, and log correlation during incident investigation."},
  {port:135,proto:"TCP",svc:"RPC / DCOM",desc:"Remote Procedure Call endpoint mapper — used by many Windows services internally.",tier:"low",alt:"—",examTip:"Often required to be open for WMI and remote management tools to function, alongside high ephemeral ports."},
  {port:137,proto:"UDP",svc:"NetBIOS Name",desc:"NetBIOS Name Service — legacy Windows name resolution.",tier:"medium",alt:"—",legacy:true,examTip:"Predates DNS-based name resolution on Windows. Still enabled by default in many environments for backward compatibility."},
  {port:138,proto:"UDP",svc:"NetBIOS Datagram",desc:"NetBIOS Datagram Service — connectionless.",tier:"low",alt:"—",legacy:true,examTip:"Rarely tested directly but completes the NetBIOS trio (137/138/139) that A+ wants you to recognize as a group."},
  {port:139,proto:"TCP",svc:"NetBIOS Session",desc:"NetBIOS Session Service — legacy file/printer sharing.",tier:"medium",alt:"—",legacy:true,examTip:"Modern Windows uses SMB directly over 445 instead of NetBIOS-over-TCP on 139 — but 139 is kept for legacy compatibility."},
  {port:143,proto:"TCP",svc:"IMAP",desc:"Syncs email. Keeps messages ON the server. Multiple device access.",tier:"high",alt:"993 (secure)",examTip:"If a user checks email from phone, laptop, and webmail and expects everything to stay in sync — that's IMAP behavior, not POP3."},
  {port:161,proto:"UDP",svc:"SNMP",desc:"Network device monitoring and queries (polls devices).",tier:"high",alt:"—",examTip:"Uses 'community strings' as a basic password (often default 'public'/'private') in SNMPv1/v2c — major security weakness fixed in SNMPv3 with real authentication/encryption."},
  {port:162,proto:"UDP",svc:"SNMP Trap",desc:"Unsolicited alerts sent FROM devices TO management station.",tier:"medium",alt:"—",examTip:"Direction matters: 161 = manager polls device. 162 = device pushes alert to manager. Opposite directions, opposite ports."},
  {port:389,proto:"TCP/UDP",svc:"LDAP",desc:"Lightweight Directory Access Protocol — Active Directory queries.",tier:"high",alt:"636 (secure)",examTip:"LDAP itself is unencrypted by default — credentials and queries can be sniffed. Always prefer LDAPS (636) or StartTLS in production."},
  {port:443,proto:"TCP",svc:"HTTPS",desc:"HTTP encrypted with TLS/SSL. Green padlock in browser.",tier:"critical",alt:"8443",examTip:"443 is also reused by many other secure protocols for firewall-friendliness (some VPNs, some RDP gateways) since it's almost never blocked outbound."},
  {port:445,proto:"TCP",svc:"SMB / CIFS",desc:"Windows file sharing, printer sharing, Active Directory.",tier:"high",alt:"—",examTip:"NEVER expose port 445 directly to the internet — it was the attack vector for WannaCry and EternalBlue ransomware worms."},
  {port:465,proto:"TCP",svc:"SMTPS",desc:"Secure SMTP over SSL. Legacy secure email submission.",tier:"medium",alt:"—",legacy:true,examTip:"Originally deprecated in favor of STARTTLS on 587, but 465 (implicit TLS) has seen a resurgence and is now an official standard again (RFC 8314)."},
  {port:514,proto:"UDP",svc:"Syslog",desc:"Forward system log messages to a centralized log server.",tier:"medium",alt:"—",examTip:"Core building block of a SIEM (Security Information and Event Management) setup — devices forward logs here for centralized analysis."},
  {port:587,proto:"TCP",svc:"SMTP Submit",desc:"Modern authenticated email submission. Uses STARTTLS.",tier:"medium",alt:"—",examTip:"This is the port your email CLIENT (Outlook, Mail app) should use to SEND mail through your provider — requires authentication, unlike raw 25."},
  {port:636,proto:"TCP",svc:"LDAPS",desc:"Secure LDAP over SSL/TLS.",tier:"medium",alt:"—",examTip:"Same +636-pairs-with-389 pattern as POP3S/995 and IMAPS/993 — recognizing this pattern saves memorization time."},
  {port:993,proto:"TCP",svc:"IMAPS",desc:"Secure IMAP over SSL/TLS.",tier:"high",alt:"—",examTip:"993 = 143 + 850. Many secure port numbers follow predictable offset patterns from their insecure counterpart — useful memory trick."},
  {port:995,proto:"TCP",svc:"POP3S",desc:"Secure POP3 over SSL/TLS.",tier:"medium",alt:"—",examTip:"995 = 110 + 885. Not a clean pattern like 993, so this one is worth memorizing directly."},
  {port:1433,proto:"TCP",svc:"MS SQL Server",desc:"Microsoft SQL Server database default port.",tier:"low",alt:"—",examTip:"Pair this with 3306 (MySQL) — A+ wants you to recognize 'this is a database port' even if you never administer the DB itself."},
  {port:3306,proto:"TCP",svc:"MySQL",desc:"MySQL/MariaDB database server default port.",tier:"medium",alt:"—",examTip:"Open database ports facing the internet are a common pentest/audit finding — databases should sit behind an application layer, not be directly exposed."},
  {port:3389,proto:"TCP/UDP",svc:"RDP",desc:"Remote Desktop Protocol — Windows graphical remote access.",tier:"critical",alt:"—",examTip:"Exposing RDP directly to the internet is a top ransomware entry vector — best practice is to require VPN first, then RDP only on the internal network."},
  {port:5060,proto:"TCP/UDP",svc:"SIP",desc:"Session Initiation Protocol — sets up VoIP calls (signaling, not the actual audio).",tier:"low",alt:"5061 (secure)",examTip:"SIP handles call SETUP. The actual voice/video media typically flows over RTP on a different dynamic port range entirely."},
  {port:5353,proto:"UDP",svc:"mDNS / Bonjour",desc:"Multicast DNS — local network name resolution without DNS server.",tier:"medium",alt:"—",examTip:"This is how AirPrint, Chromecast, and 'Bonjour' devices find each other on a LAN with zero configuration — no DNS server needed at all."},
  {port:8080,proto:"TCP",svc:"HTTP-Alt",desc:"Alternate HTTP. Web proxies, dev servers, Tomcat.",tier:"high",alt:"—",examTip:"Frequently used so a non-privileged user/process can run a web server without needing root/admin rights (ports below 1024 are typically privileged)."},
  {port:8443,proto:"TCP",svc:"HTTPS-Alt",desc:"Alternate HTTPS. Admin panels, Tomcat SSL.",tier:"medium",alt:"—",examTip:"Same privileged-port reasoning as 8080 — lets a secure web service run on a non-privileged port."},
];

const COMMANDS=[
  // NETWORK — Windows
  {cmd:"ipconfig",os:"win",cat:"Network",tier:"critical",desc:"Show basic IP config: IP address, subnet mask, default gateway."},
  {cmd:"ipconfig /all",os:"win",cat:"Network",tier:"critical",desc:"Full config: MAC address, DHCP server, DNS servers, lease times."},
  {cmd:"ipconfig /release",os:"win",cat:"Network",tier:"critical",desc:"Release current DHCP-assigned IP address."},
  {cmd:"ipconfig /renew",os:"win",cat:"Network",tier:"critical",desc:"Request a new IP address from DHCP server."},
  {cmd:"ipconfig /flushdns",os:"win",cat:"Network",tier:"critical",desc:"Clear DNS resolver cache. Fixes: can ping IP but not domain name."},
  {cmd:"ipconfig /displaydns",os:"win",cat:"Network",tier:"high",desc:"Show current contents of DNS resolver cache."},
  {cmd:"ipconfig /registerdns",os:"win",cat:"Network",tier:"medium",desc:"Re-register machine's DNS records with DNS server."},
  {cmd:"ping <host>",os:"both",cat:"Network",tier:"critical",desc:"Send ICMP echo requests — test basic reachability to a host."},
  {cmd:"ping -t <host>",os:"win",cat:"Network",tier:"high",desc:"Continuous ping until stopped with Ctrl+C."},
  {cmd:"ping -c 4 <host>",os:"linux",cat:"Network",tier:"high",desc:"Send exactly 4 pings (Linux/macOS syntax)."},
  {cmd:"tracert <host>",os:"win",cat:"Network",tier:"critical",desc:"Trace route — show each hop to destination with latency."},
  {cmd:"traceroute <host>",os:"linux",cat:"Network",tier:"high",desc:"Linux/macOS equivalent of tracert."},
  {cmd:"pathping <host>",os:"win",cat:"Network",tier:"high",desc:"Combines ping + tracert. Shows packet loss per hop over time."},
  {cmd:"nslookup <domain>",os:"both",cat:"Network",tier:"critical",desc:"Query DNS server. Resolve names to IPs. Test DNS functionality."},
  {cmd:"netstat -ano",os:"win",cat:"Network",tier:"critical",desc:"Show ALL connections, listening ports, and owning PIDs. Numerical."},
  {cmd:'netstat -an | find "LISTENING"',os:"win",cat:"Network",tier:"high",desc:"Filter netstat output to show only ports in LISTENING state."},
  {cmd:"netstat -anb",os:"win",cat:"Network",tier:"high",desc:"Show connections AND the executable/process using each port."},
  {cmd:"netstat -tulnp",os:"linux",cat:"Network",tier:"high",desc:"Linux: show all listening TCP/UDP ports with PIDs."},
  {cmd:"arp -a",os:"both",cat:"Network",tier:"high",desc:"Display ARP cache — maps IP addresses to MAC addresses."},
  {cmd:"route print",os:"win",cat:"Network",tier:"high",desc:"Display full Windows routing table."},
  {cmd:"route -n",os:"linux",cat:"Network",tier:"medium",desc:"Display Linux routing table (numerical)."},
  {cmd:"hostname",os:"both",cat:"Network",tier:"medium",desc:"Display the computer's hostname."},
  {cmd:"telnet <host> <port>",os:"win",cat:"Network",tier:"medium",desc:"Test TCP port connectivity. ⚠️ LEGACY — unencrypted.",legacy:true},
  {cmd:"Test-NetConnection -Port <n>",os:"ps",cat:"Network",tier:"high",desc:"PowerShell: test TCP port connectivity to remote host."},
  {cmd:"ifconfig",os:"linux",cat:"Network",tier:"high",desc:"Linux/macOS: display and configure network interfaces.",legacy:true,legacyNote:"Replaced by 'ip addr' on modern Linux"},
  {cmd:"ip addr show",os:"linux",cat:"Network",tier:"medium",desc:"Modern Linux: show IP addresses and interfaces."},
  {cmd:"dig <domain>",os:"linux",cat:"Network",tier:"medium",desc:"Linux/macOS: advanced DNS query tool with detailed output."},
  // REPAIR — Windows only
  {cmd:"DISM /Online /Cleanup-Image /RestoreHealth",os:"win",cat:"Repair",tier:"critical",desc:"⚡ Step 1: Repair Windows image corruption. Run BEFORE sfc."},
  {cmd:"sfc /scannow",os:"win",cat:"Repair",tier:"critical",desc:"⚡ Step 2: Scan and repair system files using the repaired image."},
  {cmd:"DISM /Online /Cleanup-Image /CheckHealth",os:"win",cat:"Repair",tier:"high",desc:"Check if Windows image is flagged as corrupted (no repair)."},
  {cmd:"chkdsk /f",os:"win",cat:"Repair",tier:"critical",desc:"Fix file system errors. Schedules run on next reboot."},
  {cmd:"chkdsk /r",os:"win",cat:"Repair",tier:"high",desc:"Locate bad sectors and recover readable data (implies /f)."},
  {cmd:"diskpart",os:"win",cat:"Repair",tier:"high",desc:"Opens an interactive disk-partitioning utility — create, delete, resize, and format partitions from the command line. More powerful (and more dangerous) than Disk Management's GUI."},
  {cmd:"bootrec /fixmbr",os:"win",cat:"Repair",tier:"high",desc:"Repair the Master Boot Record."},
  {cmd:"bootrec /fixboot",os:"win",cat:"Repair",tier:"high",desc:"Repair the boot sector of the active partition."},
  {cmd:"bootrec /scanos",os:"win",cat:"Repair",tier:"medium",desc:"Scan for Windows installations not listed in BCD."},
  {cmd:"bootrec /rebuildbcd",os:"win",cat:"Repair",tier:"high",desc:"Rebuild Boot Configuration Data store."},
  {cmd:"bcdedit",os:"win",cat:"Repair",tier:"medium",desc:"Edit Boot Configuration Data directly."},
  {cmd:"fsck /dev/sda1",os:"linux",cat:"Repair",tier:"medium",desc:"Linux file system check. Must run on unmounted partition."},
  // SYSTEM
  {cmd:"tasklist",os:"win",cat:"System",tier:"high",desc:"List all running processes with their PID and memory usage."},
  {cmd:"taskkill /PID <n> /F",os:"win",cat:"System",tier:"high",desc:"Force-terminate a process by its PID number."},
  {cmd:"taskkill /IM <name.exe> /F",os:"win",cat:"System",tier:"high",desc:"Force-terminate a process by its executable name."},
  {cmd:"ps aux",os:"linux",cat:"System",tier:"high",desc:"Linux/macOS: list all running processes with details."},
  {cmd:"kill -9 <PID>",os:"linux",cat:"System",tier:"high",desc:"Linux/macOS: force-kill a process by PID."},
  {cmd:"top / htop",os:"linux",cat:"System",tier:"medium",desc:"Linux: real-time interactive process viewer (htop is enhanced)."},
  {cmd:"whoami",os:"both",cat:"System",tier:"medium",desc:"Display the current logged-in username."},
  {cmd:"systeminfo",os:"win",cat:"System",tier:"high",desc:"Detailed system info: OS version, RAM, hotfixes, NICs, domain."},
  {cmd:"uname -a",os:"linux",cat:"System",tier:"medium",desc:"Linux: show kernel version, hostname, and system architecture."},
  {cmd:"shutdown /s",os:"win",cat:"System",tier:"medium",desc:"Shut down the computer."},
  {cmd:"shutdown /r",os:"win",cat:"System",tier:"medium",desc:"Restart the computer."},
  {cmd:"shutdown /l",os:"win",cat:"System",tier:"medium",desc:"Log off the current user."},
  {cmd:"shutdown /a",os:"win",cat:"System",tier:"medium",desc:"Abort a pending scheduled shutdown."},
  {cmd:"shutdown /s /t 60",os:"win",cat:"System",tier:"medium",desc:"Shut down after a 60-second delay."},
  {cmd:"shutdown -h now",os:"linux",cat:"System",tier:"medium",desc:"Linux/macOS: shut down immediately."},
  {cmd:"reboot",os:"linux",cat:"System",tier:"medium",desc:"Linux/macOS: restart the system immediately."},
  // ADMIN
  {cmd:"gpupdate /force",os:"win",cat:"Admin",tier:"high",desc:"Force immediate Group Policy update from domain controller."},
  {cmd:"gpresult /r",os:"win",cat:"Admin",tier:"high",desc:"Show which Group Policies are applied to current user/computer."},
  {cmd:"net use Z: \\\\server\\share",os:"win",cat:"Admin",tier:"high",desc:"Map a network shared folder to a drive letter."},
  {cmd:"net share",os:"win",cat:"Admin",tier:"high",desc:"Display or manage shared folders on this computer."},
  {cmd:"net user",os:"win",cat:"Admin",tier:"high",desc:"Manage local user accounts (list, add, delete, change password)."},
  {cmd:"net localgroup",os:"win",cat:"Admin",tier:"high",desc:"Manage local groups (add/remove members)."},
  {cmd:"wmic",os:"win",cat:"Admin",tier:"high",desc:"Windows Management Instrumentation CLI.",legacy:true,legacyNote:"Deprecated in Win11 — replaced by PowerShell"},
  {cmd:"sudo <command>",os:"linux",cat:"Admin",tier:"high",desc:"Linux/macOS: run a command with superuser (root) privileges."},
  {cmd:"chmod 755 <file>",os:"linux",cat:"Admin",tier:"medium",desc:"Linux: set file permissions. 7=rwx, 5=r-x (owner/group/other)."},
  {cmd:"chown user:group <file>",os:"linux",cat:"Admin",tier:"medium",desc:"Linux: change the owner and group of a file."},
  {cmd:"useradd / adduser",os:"linux",cat:"Admin",tier:"medium",desc:"Linux: add a new user account to the system."},
  {cmd:"passwd <user>",os:"linux",cat:"Admin",tier:"medium",desc:"Linux: change a user's password."},
  // FILES
  {cmd:"dir",os:"win",cat:"Files",tier:"high",desc:"List files and folders in the current or specified directory."},
  {cmd:"ls -la",os:"linux",cat:"Files",tier:"high",desc:"Linux/macOS: list all files including hidden, with details."},
  {cmd:"cd <path>",os:"both",cat:"Files",tier:"high",desc:"Change the current working directory."},
  {cmd:"mkdir / md",os:"win",cat:"Files",tier:"medium",desc:"Create a new directory (Windows)."},
  {cmd:"mkdir <dir>",os:"linux",cat:"Files",tier:"medium",desc:"Create a new directory (Linux/macOS)."},
  {cmd:"format <drive>:",os:"win",cat:"Files",tier:"high",desc:"Format a drive/partition with a chosen file system (NTFS, FAT32, exFAT). Erases all data on that drive."},
  {cmd:"rmdir /s <folder>",os:"win",cat:"Files",tier:"high",desc:"⚠️ Remove directory AND all contents. Plain rmdir = EMPTY dirs only!"},
  {cmd:"rm -rf <folder>",os:"linux",cat:"Files",tier:"high",desc:"⚠️ Linux: force-remove directory and all contents. Use with caution."},
  {cmd:"copy / cp",os:"both",cat:"Files",tier:"medium",desc:"Copy files. copy (Windows), cp -r (Linux for directories)."},
  {cmd:"robocopy",os:"win",cat:"Files",tier:"high",desc:"Robust file copy. Best for backups — handles open files, retries."},
  {cmd:"rsync -av <src> <dst>",os:"linux",cat:"Files",tier:"medium",desc:"Linux: robust copy/sync with progress. Like robocopy."},
  {cmd:"xcopy",os:"win",cat:"Files",tier:"medium",desc:"Extended copy with options.",legacy:true,legacyNote:"Replaced by robocopy"},
  {cmd:"move / mv",os:"both",cat:"Files",tier:"medium",desc:"Move or rename files. move (Windows), mv (Linux)."},
  {cmd:"del / rm",os:"both",cat:"Files",tier:"medium",desc:"Delete files. del (Windows), rm (Linux)."},
  {cmd:"type / cat",os:"both",cat:"Files",tier:"medium",desc:"Display file contents. type (Windows), cat (Linux)."},
  {cmd:"cls / clear",os:"both",cat:"Files",tier:"medium",desc:"Clear the terminal screen."},
  {cmd:"attrib",os:"win",cat:"Files",tier:"medium",desc:"Set/show file attributes: +R/-R (read-only), +H/-H (hidden), +S/-S (system), +A/-A (archive)."},
  {cmd:"cipher /w:C",os:"win",cat:"Files",tier:"medium",desc:"⚠️ WIPES free space to prevent file recovery. Does NOT encrypt."},
  {cmd:"takeown /f <file>",os:"win",cat:"Files",tier:"medium",desc:"Take ownership of a file or folder. /f flag is required."},
  {cmd:"grep -r 'text' /path",os:"linux",cat:"Files",tier:"medium",desc:"Linux: search for text inside files recursively."},
  {cmd:"find . -name '*.log'",os:"linux",cat:"Files",tier:"medium",desc:"Linux: find files matching a name pattern."},
  {cmd:"tree",os:"win",cat:"Files",tier:"low",desc:"Display folder structure as a visual tree."},
];

const MSC_TOOLS=[
  {name:"taskmgr",opens:"Task Manager",desc:"Processes, performance, startup apps, users, services"},
  {name:"services.msc",opens:"Services",desc:"Start/stop/configure/disable Windows services"},
  {name:"devmgmt.msc",opens:"Device Manager",desc:"Hardware, drivers, conflicts (yellow ! = problem)"},
  {name:"eventvwr.msc",opens:"Event Viewer",desc:"System, Application, Security event logs"},
  {name:"msconfig",opens:"System Configuration",desc:"Boot options, safe mode, startup programs"},
  {name:"regedit",opens:"Registry Editor",desc:"Windows registry — HKLM, HKCU, HKCR, HKU, HKCC"},
  {name:"compmgmt.msc",opens:"Computer Management",desc:"Disk, users, events, services — combined hub"},
  {name:"diskmgmt.msc",opens:"Disk Management",desc:"Partitions, volumes, format, drive letters, RAID"},
  {name:"gpedit.msc",opens:"Group Policy Editor",desc:"Local Group Policy — Pro/Enterprise editions ONLY"},
  {name:"lusrmgr.msc",opens:"Local Users & Groups",desc:"Manage local user accounts and group memberships"},
  {name:"perfmon.msc",opens:"Performance Monitor",desc:"Real-time performance data and custom counters"},
  {name:"taskschd.msc",opens:"Task Scheduler",desc:"Schedule scripts/programs to run automatically at specific times or triggers"},
  {name:"certmgr.msc",opens:"Certificate Manager",desc:"View, import, export, and manage digital certificates for the current user"},
  {name:"msinfo32",opens:"System Information",desc:"Detailed hardware/software/driver inventory in one place — useful for troubleshooting"},
  {name:"ncpa.cpl",opens:"Network Connections",desc:"Network adapters, TCP/IP properties"},
  {name:"appwiz.cpl",opens:"Programs & Features",desc:"Install/uninstall applications"},
  {name:"mmc",opens:"Management Console",desc:"Build custom admin snap-in consoles"},
  {name:"control",opens:"Control Panel",desc:"Legacy system settings hub"},
  {name:"winver",opens:"Windows Version",desc:"Show exact Windows version and build number"},
  {name:"resmon.exe",opens:"Resource Monitor",desc:"Deep real-time view of CPU, memory, disk, and network usage per process"},
  {name:"cleanmgr.exe",opens:"Disk Cleanup",desc:"Removes temporary files, old system files, and other reclaimable disk space"},
  {name:"dfrgui.exe",opens:"Disk Defragment",desc:"Defragments HDDs (reorganizes scattered file fragments) or optimizes SSDs (TRIM)"},
];

// ─── macOS FEATURES & TOOLS (Official Objective 1.8) ─────────────────────────
const MACOS_FEATURES=[
  {name:"Finder",desc:"macOS's file manager — the equivalent of Windows File Explorer. Used to browse files, folders, and connected drives."},
  {name:"Spotlight",desc:"System-wide search (Cmd+Space) — quickly find files, launch apps, do quick calculations, or search the web, all from one search box."},
  {name:"Mission Control",desc:"Shows all open windows and desktops (Spaces) at once for quick navigation — macOS's equivalent to Windows' Task View."},
  {name:"Keychain",desc:"macOS's built-in password manager — securely stores website passwords, Wi-Fi passwords, and certificates."},
  {name:"Time Machine",desc:"macOS's built-in backup tool — automatically creates incremental backups to an external or network drive over time."},
  {name:"FileVault",desc:"macOS's full-disk encryption feature — the direct equivalent of Windows BitLocker."},
  {name:"Terminal",desc:"macOS's command-line interface, built on a Unix foundation — many Linux commands work here too."},
  {name:"Disk Utility",desc:"Used to format, partition, repair, and manage disks — the macOS equivalent of Windows Disk Management."},
  {name:"iCloud",desc:"Apple's cloud service — syncs Drive storage, iMessage, FaceTime, and other data across all of a user's Apple devices."},
  {name:"Force Quit",desc:"macOS's way to kill an unresponsive application — the equivalent of ending a task in Windows Task Manager."},
  {name:"Gestures",desc:"Multi-touch trackpad gestures (pinch to zoom, swipe between desktops, etc.) unique to macOS's trackpad-centric design."},
  {name:"Multiple Desktops",desc:"Create several separate virtual desktop spaces, each with its own set of open apps/windows, to organize different workflows — accessed and managed through Mission Control."},
  {name:"Continuity",desc:"A suite of features letting Apple devices work together seamlessly — Handoff (start a task on one device, continue on another), Universal Clipboard (copy on one device, paste on another), and using an iPhone/iPad as a webcam or second display."},
  {name:"Dock",desc:"The bar of app icons (usually at the bottom of the screen) for quick access to frequently used and currently running applications — macOS's equivalent to the Windows taskbar."},
  {name:"Rapid Security Response (RSR)",desc:"Small, fast-deploying Apple security patches that install between full macOS updates, addressing urgent vulnerabilities without waiting for the next major OS update cycle."},
];
const MACOS_FILE_TYPES=[
  {ext:".dmg",desc:"Disk image file — the most common way Mac apps are distributed. Mount it, then drag the app into Applications."},
  {ext:".pkg",desc:"Installer package — runs a guided installation process, similar to a Windows .msi installer."},
  {ext:".app",desc:"The actual application bundle itself — technically a folder that macOS treats as a single double-clickable app."},
];
const MACOS_FOLDERS=[
  {folder:"/Applications",desc:"Where installed apps live — similar to Program Files on Windows."},
  {folder:"/Users",desc:"Contains each user's home folder and personal files."},
  {folder:"/Library",desc:"System-wide support files, preferences, and caches shared by all users."},
  {folder:"/System",desc:"Core macOS system files. Protected — not meant to be modified by users."},
  {folder:"/Users/Library",desc:"Support files, preferences, and caches specific to ONE user, not shared system-wide."},
];

// ─── LINUX CLIENT COMMANDS & CONCEPTS (Official Objective 1.9) ──────────────
const LINUX_COMMANDS=[
  {cmd:"pwd",cat:"File",desc:"Print Working Directory — shows the full path of the directory you're currently in."},
  {cmd:"ls",cat:"File",desc:"List the contents of the current directory."},
  {cmd:"cp",cat:"File",desc:"Copy a file or directory."},
  {cmd:"mv",cat:"File",desc:"Move or rename a file or directory."},
  {cmd:"rm",cat:"File",desc:"Remove (delete) a file. Use -r to remove a directory and its contents recursively."},
  {cmd:"chmod",cat:"File",desc:"Change a file's permissions (read/write/execute for owner/group/other)."},
  {cmd:"chown",cat:"File",desc:"Change which user and group owns a file."},
  {cmd:"grep",cat:"File",desc:"Search for a text pattern inside files."},
  {cmd:"find",cat:"File",desc:"Search the file system for files matching given criteria (name, size, date, etc.)."},
  {cmd:"fsck",cat:"Filesystem",desc:"File System Consistency checK — checks and repairs a Linux file system, similar to Windows' chkdsk."},
  {cmd:"mount",cat:"Filesystem",desc:"Attaches a drive/partition/network share to a specific folder location so it can be accessed."},
  {cmd:"su",cat:"Admin",desc:"Switch User — log in as a different user (often root) within the current session."},
  {cmd:"sudo",cat:"Admin",desc:"Run a single command with elevated (root/administrator) privileges without fully switching users."},
  {cmd:"apt",cat:"Package",desc:"Package manager used on Debian/Ubuntu-based distributions to install, update, and remove software."},
  {cmd:"dnf",cat:"Package",desc:"Package manager used on Fedora/RHEL-based distributions — the modern replacement for yum."},
  {cmd:"ip",cat:"Network",desc:"Modern command to view/configure network interfaces, addresses, and routing (replaces older ifconfig)."},
  {cmd:"ping",cat:"Network",desc:"Test basic network reachability to a host — same concept as Windows ping."},
  {cmd:"curl",cat:"Network",desc:"Transfer data to/from a URL directly from the command line — commonly used to test web servers or download files."},
  {cmd:"dig",cat:"Network",desc:"Query DNS servers directly for detailed domain lookup information."},
  {cmd:"traceroute",cat:"Network",desc:"Linux equivalent of Windows tracert — shows every hop to a destination."},
  {cmd:"man",cat:"Info",desc:"Manual — shows the built-in documentation/help page for any command."},
  {cmd:"cat",cat:"Info",desc:"Concatenate — displays the full contents of a file directly in the terminal."},
  {cmd:"top",cat:"Info",desc:"Real-time view of running processes and system resource usage — similar to Task Manager's Processes tab."},
  {cmd:"ps",cat:"Info",desc:"Snapshot listing of currently running processes."},
  {cmd:"du",cat:"Info",desc:"Disk Usage — shows how much space files/folders are consuming."},
  {cmd:"df",cat:"Info",desc:"Disk Free — shows available and used space on mounted file systems."},
  {cmd:"nano",cat:"Editor",desc:"A simple, beginner-friendly command-line text editor built into most Linux distributions."},
];
const LINUX_CONFIG_FILES=[
  {file:"/etc/passwd",desc:"Stores basic information about every user account on the system (username, user ID, home directory, etc.)."},
  {file:"/etc/shadow",desc:"Stores the actual (encrypted) user passwords — kept separate from /etc/passwd for security since passwd is often world-readable."},
  {file:"/etc/hosts",desc:"A local, manual list of hostname-to-IP mappings — checked before DNS. Same concept and purpose as the Windows hosts file."},
  {file:"/etc/fstab",desc:"File System Table — defines which drives/partitions should be automatically mounted at boot, and where."},
  {file:"/etc/resolv.conf",desc:"Specifies which DNS servers the system should use for name resolution."},
];
const LINUX_OS_COMPONENTS=[
  {component:"Kernel",desc:"The core of the OS — manages hardware, memory, and processes at the lowest level. Everything else runs on top of it."},
  {component:"systemd",desc:"The modern init system on most major distributions — starts services, manages the boot process, and controls system state."},
  {component:"Bootloader",desc:"The first software that runs to actually load the Linux kernel from disk into memory (e.g., GRUB is the most common one)."},
  {component:"Root account",desc:"The Linux superuser account with unrestricted system access — the direct equivalent of Windows' built-in Administrator account."},
];

const CABLES=[
  {name:"UTP",full:"Unshielded Twisted Pair",connector:"RJ45",maxLen:"100 m",pros:"Cheapest, most flexible, easiest install",cons:"No EMI shielding",uses:"Offices, homes — standard Ethernet",color:T.green},
  {name:"STP",full:"Shielded Twisted Pair",connector:"RJ45",maxLen:"100 m",pros:"Foil/braid shield reduces EMI/RFI",cons:"Heavier, stiffer, costs more",uses:"Factories, hospitals, near heavy machinery",color:T.accent},
  {name:"Coaxial",full:"Coaxial Cable",connector:"F-Type or BNC",maxLen:"Varies",pros:"Good EMI resistance, shielded copper core",cons:"Bulky, stiff, harder to route",uses:"Cable internet (F-Type), CCTV (BNC)",color:T.yellow},
  {name:"SMF",full:"Single-Mode Fiber",connector:"LC or SC",maxLen:"Kilometers (100s km)",pros:"Longest distance, EMI-immune, most secure",cons:"Expensive, fragile, needs precision connectors",uses:"ISP backbone, campus WAN, long-haul",color:T.cyan},
  {name:"MMF",full:"Multi-Mode Fiber",connector:"LC or SC",maxLen:"Up to 550 m",pros:"Cheaper than SMF, very fast, EMI-immune",cons:"Shorter distance than SMF",uses:"Data centers, buildings, LAN backbone",color:T.purple},
  {name:"Plenum-Rated",full:"Plenum Cable",connector:"Varies (jacket type, not a connector)",maxLen:"Same as underlying cable type",pros:"Fire-resistant, low-smoke jacket material — required by fire code",cons:"More expensive than standard (PVC) jacket cable",uses:"Required in air-handling spaces: above drop ceilings, inside HVAC ductwork",color:T.orange},
  {name:"Direct Burial",full:"Direct Burial Cable",connector:"Varies",maxLen:"Same as underlying cable type",pros:"Extra-thick waterproof jacket rated for burial straight in the ground, no conduit needed",cons:"Thicker and stiffer than indoor cable",uses:"Running cable between buildings underground",color:T.muted},
];

const CONNECTORS=[
  {name:"RJ45",pins:"8P8C",desc:"Standard Ethernet connector. 8 pins, 8 conductors.",uses:"All UTP/STP Ethernet cables",color:T.accent},
  {name:"RJ11",pins:"6P2C",desc:"Telephone connector. 6 positions, 2 conductors used.",uses:"Phone lines, DSL modems",color:T.cyan},
  {name:"LC",pins:"Duplex",desc:"Small form factor fiber. Uses a clip latch. Most common in new installs.",uses:"High-density fiber patch panels, SFP",color:T.accent},
  {name:"SC",pins:"Single/Duplex",desc:"Square body, push-pull connector. Older standard.",uses:"Older fiber installations",color:T.purple},
  {name:"ST",pins:"Single",desc:"Round bayonet twist-lock. One of the oldest fiber types.",uses:"Legacy fiber installs",color:T.yellow,legacy:true},
  {name:"F-Type",pins:"Threaded",desc:"Threaded coaxial connector. Screw-on.",uses:"Cable TV, cable modems, satellite",color:T.orange},
  {name:"BNC",pins:"Bayonet",desc:"Bayonet Neill-Concelman. Twist-lock coaxial.",uses:"Legacy CCTV, older video/networking",color:T.green,legacy:true},
  {name:"SFP/SFP+",pins:"Hot-swap",desc:"Small Form-Factor Pluggable transceiver. Converts between fiber/copper and switch ports.",uses:"Switches, routers, NICs",color:T.accent},
  {name:"eSATA",pins:"7-pin (external)",desc:"External version of SATA — connects external hard drives at full SATA speed, unlike USB which has more overhead.",uses:"External hard drive enclosures",color:T.cyan},
  {name:"DB9",pins:"9-pin D-shell",desc:"Legacy serial connector, once used for mice, modems, and early networking equipment.",uses:"Legacy serial devices, some network device console ports",color:T.muted,legacy:true},
  {name:"Punchdown Block",pins:"Multiple (66 or 110 block)",desc:"A block of metal terminals that individual wires are 'punched down' into — used to terminate many phone or network cables in a wiring closet.",uses:"Telephone and network cable termination panels",color:T.orange},
];

// ─── VIDEO & PERIPHERAL CABLES (Official Objective 3.2) ─────────────────────
const VIDEO_CABLES=[
  {name:"HDMI",full:"High-Definition Multimedia Interface",desc:"Carries BOTH video and audio in one cable. The most common video connector on modern monitors and TVs.",color:T.accent},
  {name:"DisplayPort",full:"DisplayPort",desc:"Similar to HDMI — carries video and audio. Common on PC monitors and graphics cards, especially for high refresh rates.",color:T.cyan},
  {name:"DVI",full:"Digital Visual Interface",desc:"Video ONLY, no audio. Older standard, still found on some monitors. Comes in DVI-D (digital), DVI-A (analog), DVI-I (both).",color:T.yellow,legacy:true},
  {name:"VGA",full:"Video Graphics Array",desc:"Analog video only, no audio. Blue 15-pin connector. Legacy — lower quality than digital standards.",color:T.orange,legacy:true},
  {name:"USB-C",full:"USB Type-C (video mode)",desc:"Can carry video via DisplayPort Alt Mode or Thunderbolt, plus power and data, all over one reversible connector.",color:T.green},
  {name:"Thunderbolt",full:"Thunderbolt",desc:"High-speed Apple/Intel standard. Carries video, data, and power. Physically uses the USB-C connector shape (Thunderbolt 3+).",color:T.purple},
];
const PERIPHERAL_CABLES=[
  {name:"USB 2.0",desc:"Up to 480 Mbps. Still common for keyboards, mice, and basic peripherals.",color:T.muted},
  {name:"USB 3.0",desc:"Up to 5 Gbps (marketed as SuperSpeed). Usually has a blue connector/port for identification.",color:T.accent},
  {name:"Serial",desc:"Legacy DB-9 connector. Used for old peripherals and some network device console connections today.",color:T.yellow,legacy:true},
  {name:"Thunderbolt",desc:"See video cables — also used for high-speed peripheral/storage connections, not just displays.",color:T.purple},
];

// ─── DISPLAY COMPONENTS & ATTRIBUTES (Official Objective 3.1) ───────────────
const DISPLAY_TYPES=[
  {name:"TN",full:"Twisted Nematic (LCD)",desc:"Fastest response time, cheapest. Worst color accuracy and viewing angles. Common in budget/gaming monitors prioritizing speed.",color:T.yellow},
  {name:"IPS",full:"In-Plane Switching (LCD)",desc:"Best color accuracy and viewing angles. Slower response time than TN. Common for design work and quality-focused monitors.",color:T.accent},
  {name:"VA",full:"Vertical Alignment (LCD)",desc:"Middle ground — best contrast ratio/deepest blacks of the three LCD types, decent color, slower than TN.",color:T.cyan},
  {name:"OLED",full:"Organic Light-Emitting Diode",desc:"Each pixel emits its own light (no backlight needed). Perfect blacks, excellent contrast. Risk of burn-in with static images over time.",color:T.purple},
  {name:"Mini-LED",full:"Mini Light-Emitting Diode",desc:"Traditional LCD panel with thousands of tiny LED backlight zones for much better local contrast than standard LCD, without OLED's burn-in risk.",color:T.green},
];
const DISPLAY_ATTRIBUTES=[
  {attr:"Digitizer",desc:"The layer that detects touch input and converts it to coordinates — what makes a touchscreen actually respond to your finger/stylus."},
  {attr:"Inverter",desc:"Converts DC power to the AC needed by CCFL backlights on older LCDs. Mostly obsolete now that LED backlighting dominates.",legacy:true},
  {attr:"Pixel density",desc:"How many pixels are packed into a given area (measured in PPI). Higher density = sharper image at the same screen size."},
  {attr:"Refresh rate",desc:"How many times per second the display redraws the image (measured in Hz). Higher = smoother motion, important for gaming."},
  {attr:"Screen resolution",desc:"Total pixel count (width × height), e.g. 1920×1080. Higher resolution = more detail, but needs more GPU power to drive."},
  {attr:"Color gamut",desc:"The range of colors a display can reproduce. A wider gamut (like Adobe RGB or DCI-P3) shows more vivid, accurate colors — important for design/photo work."},
];

// ─── PRINTER TYPES BEYOND LASER/INKJET (Official Objective 3.7/3.8) ─────────
const PRINTER_TYPES=[
  {type:"Laser",process:"Electrophotographic — 7-step imaging process",maintenance:"Replace toner, apply maintenance kit, calibrate, clean",color:T.accent},
  {type:"Inkjet",process:"Sprays liquid ink through a printhead onto paper",maintenance:"Clean printheads, replace cartridges, calibrate, clear jams",color:T.cyan},
  {type:"Thermal",process:"Heats special thermal paper directly — no ink or toner at all",maintenance:"Replace paper, clean the heating element, remove debris. Common in receipt printers.",color:T.yellow},
  {type:"Impact",process:"A print head physically strikes an ink ribbon against paper — like an old typewriter",maintenance:"Replace ribbon, printhead, and paper. Used for multipart forms (carbon-copy style) since it works through multiple sheets at once.",color:T.orange,legacy:true},
];

// ─── PRINTER SETUP, DRIVERS & SECURITY (Official Objective 3.7) ────────────
const PRINTER_DRIVERS=[
  {name:"PCL",full:"Printer Command Language",desc:"HP's widely-supported printer language — fast processing, good for everyday text/graphics printing. The most common driver language."},
  {name:"PostScript",desc:"Adobe's page description language — handles complex graphics and precise color/scaling better than PCL, common in graphic design and professional print environments."},
];
const PRINTER_CONFIG_OPTIONS=[
  {setting:"Duplex printing",desc:"Automatically prints on both sides of the paper — requires hardware support (a duplexer) or manual flip depending on the printer."},
  {setting:"Orientation",desc:"Portrait (tall) or landscape (wide) page layout."},
  {setting:"Paper tray selection",desc:"Choosing which input tray to pull paper from — useful when a printer has multiple trays loaded with different paper sizes/types."},
  {setting:"Print quality",desc:"Draft, normal, or high-quality settings — trades speed and ink/toner usage for output sharpness."},
];
const PRINTER_SECURITY=[
  {feature:"User authentication",desc:"Requires a user to log in (PIN, badge, or credentials) at the printer before a job releases — prevents sensitive documents sitting unattended in the output tray."},
  {feature:"Badging",desc:"Using an employee ID badge tapped at the printer itself to release a held print job."},
  {feature:"Audit logs",desc:"Records of who printed what and when — used for compliance and tracking unusual print activity."},
  {feature:"Secured prints / pull printing",desc:"The print job is held on the server until the user physically authenticates at the printer to release it — the document doesn't sit in the tray for anyone to grab."},
];
const PRINTER_SCAN_DELIVERY=[
  {method:"Scan to email",desc:"Scanned document is automatically emailed to a specified address."},
  {method:"Scan to SMB",desc:"Scanned document is automatically saved to a shared network folder."},
  {method:"Scan to cloud",desc:"Scanned document is uploaded directly to a cloud storage service (OneDrive, Google Drive, etc.)."},
];
const PRINTER_INPUT_TYPES=[
  {name:"ADF",full:"Automatic Document Feeder",desc:"Automatically feeds multiple pages through the scanner one at a time — used for scanning/copying multi-page documents without manually placing each page."},
  {name:"Flatbed",desc:"A flat glass surface you place a single document or book on to scan — used for items that can't go through an ADF (bound books, fragile pages, ID cards)."},
];

// ─── MOBILE DEVICE ACCESSORIES (Official Objective 1.2) ─────────────────────
const MOBILE_ACCESSORIES=[
  {name:"Stylus",desc:"A pen-like input device for touchscreens — precise input for drawing, notes, or navigating small UI elements."},
  {name:"Docking station",desc:"A stand a laptop connects to (often with one cable) that provides multiple ports — monitors, Ethernet, USB devices — all at once."},
  {name:"Port replicator",desc:"Similar to a docking station but simpler — just extends the laptop's existing ports, without necessarily adding new capabilities."},
  {name:"Trackpad/drawing pad/track points",desc:"Built-in pointing devices on a laptop. Track points are the small joystick-like nub some business laptops (like ThinkPads) include between keys."},
  {name:"Headsets / Speakers / Webcam",desc:"Standard audio/video accessories, typically connected via USB, Bluetooth, or a 3.5mm jack."},
];

// ─── MOBILE DEVICES — FULL DOMAIN 1.0 (Core 1, 13% weight) ──────────────────
const MOBILE_HW_REPLACEMENT=[
  {part:"Battery",desc:"Most commonly replaced laptop/mobile part. Swelling is a serious safety hazard — stop using the device and dispose of a swollen battery properly (never puncture)."},
  {part:"Keyboard/keys",desc:"Individual keycaps or the full keyboard assembly can be replaced. Laptop keyboards are often a single ribbon-cable unit under the palm rest."},
  {part:"RAM",desc:"Some laptops have accessible RAM slots (SODIMM); many modern ultrabooks solder RAM directly to the board, making it non-upgradeable."},
  {part:"HDD/SSD",desc:"Storage can usually be replaced or upgraded through an access panel. Always back up data first and consider migrating the existing drive's contents to the new one."},
  {part:"Wireless cards",desc:"Wi-Fi/Bluetooth combo cards can often be swapped for a newer standard, connected via a small M.2 slot with tiny antenna wire connectors."},
  {part:"Wi-Fi antenna connector/placement",desc:"Antenna wires run from the wireless card up through the display hinge to antennas built into the screen bezel — a common point of accidental damage during repairs."},
  {part:"Camera/webcam",desc:"Usually integrated into the display bezel on laptops, connected by a thin ribbon cable."},
  {part:"Microphone",desc:"Often built into the same module as the camera, or located near the keyboard."},
];
const MOBILE_PRIVACY_SECURITY=[
  {name:"Biometrics",desc:"Fingerprint readers and facial recognition built into mobile devices/laptops for secure, fast login."},
  {name:"Near-field scanner features",desc:"NFC-based features used for secure authentication or contactless actions, distinct from NFC's payment use case."},
  {name:"Screen lock types",desc:"Facial recognition, PIN, fingerprint, pattern, or swipe — the range of methods a mobile device can use to require unlocking. Facial/fingerprint are strongest and most convenient; swipe-only offers essentially no real security."},
  {name:"Failed login attempt restrictions",desc:"After too many incorrect unlock attempts, the device can lock out further attempts temporarily, or in some configurations, automatically wipe itself — a strong deterrent against brute-forcing a lost/stolen device's PIN."},
];
const MOBILE_CONNECTION_METHODS=[
  {method:"USB/USB-C/microUSB/miniUSB",desc:"The family of USB connector shapes used for charging and data on mobile devices. USB-C is the modern standard, reversible and increasingly universal."},
  {method:"Lightning",desc:"Apple's proprietary connector used on iPhones/iPads before the shift to USB-C."},
  {method:"NFC",desc:"Near Field Communication — very short range (a few cm), used for tap-to-pay and quick pairing."},
  {method:"Bluetooth",desc:"Short-range wireless (~10m) for headphones, keyboards, and other peripherals."},
  {method:"Tethering/hotspot",desc:"Sharing a mobile device's cellular data connection with other devices, either via a direct cable/Bluetooth connection (tethering) or by broadcasting Wi-Fi (hotspot)."},
];
const MOBILE_NETWORK_CONFIG=[
  {feature:"Wireless/cellular data (enable/disable)",desc:"3G/4G/5G cellular data, hotspot, Wi-Fi, and SIM/eSIM settings — all toggleable independently on a mobile device."},
  {feature:"Bluetooth pairing process",desc:"Enable Bluetooth → enable pairing/discoverable mode → find the target device → enter the PIN code if prompted → test connectivity to confirm the pairing worked."},
  {feature:"Location services",desc:"GPS services (satellite-based) and cellular location services (triangulation using cell towers) — GPS is more accurate but drains more battery."},
  {feature:"MDM device configurations",desc:"Mobile Device Management can configure devices differently depending on whether they're corporate-owned or BYOD (Bring Your Own Device), enforcing policies and pushing corporate apps."},
  {feature:"Mobile device synchronization",desc:"Keeping calendar, contacts, mail, and cloud storage in sync across devices — with awareness of data caps, since heavy sync can consume significant cellular data."},
];

const NET_DEVICES=[
  {name:"Router",layer:3,color:T.accent,desc:"Connects multiple different networks. Routes by IP address. Handles NAT, DHCP, firewall. Is the Default Gateway.",tip:"Layer 3 — IP — connects networks"},
  {name:"Switch",layer:2,color:T.green,desc:"Connects devices on same network. Uses MAC address table (CAM). Full duplex. Separate collision domain per port. Managed switches allow configuration (VLANs, port security, monitoring); unmanaged switches are plug-and-play with zero configuration options.",tip:"Layer 2 — MAC — same network"},
  {name:"Hub",layer:1,color:T.muted,desc:"Repeats ALL data out ALL ports. Shared collision domain. Half duplex only. NEVER used today.",tip:"Layer 1 — dumb repeater",legacy:true},
  {name:"Wireless AP",layer:2,color:T.yellow,desc:"Wireless Access Point. Provides Wi-Fi. Bridges wireless clients to wired network.",tip:"Layer 2 — wireless bridge"},
  {name:"Modem",layer:1,color:T.orange,desc:"Modulates/demodulates signal. Converts between digital data and analog carrier (cable, DSL, fiber).",tip:"Layer 1 — ISP connection"},
  {name:"Firewall",layer:"3–4",color:T.red,desc:"Monitors/filters traffic by port/IP rules. Stateful inspection. Next-gen can inspect up to Layer 7.",tip:"A+ exam: primarily Layer 3–4"},
  {name:"NIC",layer:2,color:T.purple,desc:"Network Interface Card. Every device needs one to connect. Has a unique MAC address burned in.",tip:"Layer 2 — has MAC address"},
  {name:"Patch Panel",layer:1,color:T.muted,desc:"Organizes and terminates cable runs in a rack. Passive device — no power, no intelligence.",tip:"Layer 1 — passive cable org"},
  {name:"PoE Switch",layer:2,color:T.cyan,desc:"Power over Ethernet switch. Provides power AND data over the same cable to APs, cameras, phones.",tip:"802.3af/at/bt standards"},
  {name:"Bridge",layer:2,color:T.muted,desc:"Connects two LAN segments. Filters by MAC. Mostly replaced by switches.",tip:"Layer 2",legacy:true},
];

// ─── SERVER ROLES (Official Objective 2.3) ───────────────────────────────────
const SERVER_ROLES=[
  {role:"DNS server",desc:"Translates domain names to IP addresses for the whole network."},
  {role:"DHCP server",desc:"Automatically assigns IP addresses to devices joining the network."},
  {role:"Fileshare server",desc:"Central storage location where users store and access shared files/folders."},
  {role:"Print server",desc:"Manages print jobs and printer queues for a network, letting many users share printers."},
  {role:"Mail server",desc:"Sends, receives, and stores email (SMTP for sending, POP3/IMAP for retrieving)."},
  {role:"Syslog server",desc:"Centralized destination that collects log messages forwarded from many devices, for monitoring and auditing."},
  {role:"Web server",desc:"Hosts websites and serves web pages to browsers over HTTP/HTTPS."},
  {role:"AAA server",desc:"Handles Authentication, Authorization, and Accounting — typically RADIUS or TACACS+."},
  {role:"Database server",desc:"Stores and manages structured data that applications query and update."},
  {role:"NTP server",desc:"Keeps every device's clock synchronized to the same accurate time."},
];
const NETWORK_APPLIANCES=[
  {name:"Spam gateway",desc:"Filters incoming email for spam and malicious content before it reaches the mail server."},
  {name:"UTM",full:"Unified Threat Management",desc:"An all-in-one security appliance combining firewall, antivirus, intrusion prevention, and content filtering into a single device."},
  {name:"Load balancer",desc:"Distributes incoming network traffic across multiple servers, preventing any one server from being overwhelmed."},
  {name:"Proxy server",desc:"Sits between clients and the internet, forwarding requests on their behalf — used for content filtering, caching, and anonymity."},
];
const LEGACY_SYSTEMS=[
  {name:"SCADA",full:"Supervisory Control and Data Acquisition",desc:"Legacy/embedded industrial control systems that monitor and control physical equipment (power plants, water treatment, manufacturing). Often runs outdated software that's difficult to patch."},
  {name:"IoT devices (as a network category)",desc:"Everyday physical devices connected to a network — smart thermostats, cameras, sensors — often with weak default security."},
];
const NETWORKING_TOOLS_EXTRA=[
  {name:"Network tap",desc:"A hardware device inserted into a network cable that passively copies all traffic passing through it, for monitoring/analysis without disrupting the connection."},
  {name:"Loopback plug",desc:"A small connector that wires the transmit pins directly back to the receive pins, used to test whether a NIC or port can send and receive correctly."},
  {name:"Cable stripper",desc:"Removes the outer jacket from a cable without damaging the wires inside — the first step before terminating a cable with a connector."},
  {name:"Wi-Fi analyzer",desc:"Software or hardware tool that scans nearby wireless networks, showing signal strength, channel usage, and interference — used to pick the best channel or troubleshoot weak signal."},
  {name:"Punchdown tool",desc:"Pushes individual wires into the small metal slots of a punchdown block or keystone jack, cutting the wire's insulation and making the electrical connection in one motion."},
];
const WAN_TECHNOLOGIES=[
  {name:"Satellite",desc:"Internet delivered via satellite dish. Works almost anywhere with sky visibility, but has high latency (signal travels to space and back) and is affected by weather.",color:T.purple},
  {name:"Fiber",desc:"Internet delivered over fiber optic cable. Fastest and most reliable option where available — very high speeds with minimal latency.",color:T.cyan},
  {name:"Cable",desc:"Internet delivered over the same coaxial cable used for cable TV, via a cable modem. Widely available, good speeds, shared bandwidth with neighbors on the same node.",color:T.yellow},
  {name:"DSL",full:"Digital Subscriber Line",desc:"Internet delivered over existing telephone lines. Slower than cable/fiber and speed drops the farther you are from the provider's central office.",color:T.orange},
  {name:"Cellular",desc:"Internet delivered over the cellular network (4G/5G) — used for mobile hotspots and fixed wireless internet where wired options aren't available.",color:T.green},
  {name:"WISP",full:"Wireless Internet Service Provider",desc:"Delivers internet access wirelessly, often via fixed outdoor antennas pointed at a tower — common in rural areas where running fiber/cable isn't practical.",color:T.accent},
];

const HARDWARE_COMPONENTS=[
  {name:"HDD",full:"Hard Disk Drive",speed:"~100–150 MB/s",desc:"Magnetic rotating platters with moving read/write head. 7,200 RPM typical desktop, 5,400 RPM common in laptops. Cheapest per GB. Fragile — susceptible to physical shock. SATA interface. Form factors: 3.5-inch (desktops) and 2.5-inch (laptops, and some desktop SSDs for compatibility).",color:T.muted},
  {name:"SSD (SATA)",full:"Solid State Drive",speed:"~500–600 MB/s",desc:"Flash memory, no moving parts. SATA bus interface. Much faster than HDD. Shock resistant. More expensive per GB. Same connectors as HDD.",color:T.cyan},
  {name:"NVMe M.2",full:"NVMe PCIe SSD",speed:"3,000–7,000+ MB/s",desc:"PCIe bus — bypasses SATA entirely. Direct CPU connection. Fastest consumer storage. M.2 form factor (2280 most common). Key M or B+M.",color:T.purple},
  {name:"RAM",full:"Random Access Memory",speed:"DDR4: 2133–5333 MHz",desc:"Volatile — loses data on power off. DDR4 or DDR5. DIMM (desktop) / SO-DIMM (laptop). Dual-channel = 2 matched sticks. More RAM = better multitasking.",color:T.green},
  {name:"CPU",full:"Central Processing Unit",speed:"3.0–5.5+ GHz",desc:"Processor — executes all instructions. AMD or Intel, x86/x64 architecture (or ARM in some laptops/mobile devices). Cores × Threads = parallelism. Socket type must match motherboard. L1/L2/L3 cache. Needs thermal paste + cooler — either air (heat sink + fan) or liquid (AIO or custom loop) cooling.",color:T.yellow},
  {name:"GPU",full:"Graphics Processing Unit",speed:"Varies widely",desc:"Renders graphics. Dedicated (discrete) card or integrated into CPU (iGPU). PCIe x16 slot. Has its own VRAM. Required for gaming, video editing, ML.",color:T.orange},
  {name:"PSU",full:"Power Supply Unit",speed:"80+ efficiency rating",desc:"Converts 120/240V AC to DC voltages (3.3V, 5V, 12V). 80 PLUS rated (Bronze→Silver→Gold→Platinum→Titanium). 20+4 pin ATX connector. Modular vs non-modular. Redundant PSU setups (servers) use two+ power supplies so one can fail without downtime.",color:T.orange},
  {name:"Motherboard",full:"Motherboard / Mainboard",speed:"Depends on chipset",desc:"ATX, Micro-ATX, Mini-ITX form factors. CPU socket (LGA/AM5). RAM slots. PCIe slots. BIOS/UEFI chip. Chipset governs features. I/O panel.",color:T.accent},
];

// ─── RAM & STORAGE COMPLETENESS (Core 1 objectives 3.3/3.4) ─────────────────
const RAM_STORAGE_DEPTH=[
  {term:"ECC RAM",full:"Error-Correcting Code RAM",desc:"Detects and automatically corrects small memory errors on the fly — used in servers and workstations where data integrity is critical. Costs more, and requires motherboard support."},
  {term:"Non-ECC RAM",desc:"Standard consumer RAM without error correction — what's in nearly all home/office desktops and laptops. Cheaper, slightly faster, no error protection."},
  {term:"mSATA",full:"Mini-serial Advanced Technology Attachment",desc:"An older, smaller SSD form factor that predates M.2 — still found in some older ultrabooks. Physically and electrically different from M.2, not interchangeable."},
  {term:"Direct burial (cable)",desc:"Ethernet cable specifically rated and jacketed to be buried directly in the ground without conduit, resisting moisture and soil chemicals — used for runs between buildings."},
];

// ─── MOTHERBOARD CONNECTORS & EXPANSION SLOTS (Module 4 depth) ──────────────
const MOBO_CONNECTORS=[
  {name:"24-pin ATX power",desc:"Main power connector from the PSU to the motherboard. Sometimes shown as 20+4 pin — the 4-pin block detaches for compatibility with older 20-pin-only boards."},
  {name:"4/8-pin CPU power (EPS)",desc:"Separate power connector dedicated just to the CPU, plugged in near the CPU socket. High-end boards use 8-pin (sometimes two 8-pin) for more power delivery."},
  {name:"SATA data connector",desc:"Thin L-shaped 7-pin connector carrying data between the motherboard and a SATA HDD/SSD."},
  {name:"SATA power connector",desc:"Flat 15-pin connector from the PSU providing power to SATA drives — separate cable from the SATA data cable."},
  {name:"Molex connector",desc:"Older 4-pin power connector, still used for some case fans, older peripherals, and fan/RGB controllers.",legacy:true},
  {name:"Front panel header",desc:"Small pin block connecting the case's power button, reset button, power LED, and HDD activity LED to the motherboard."},
  {name:"USB header",desc:"Internal motherboard connector that front-panel or internal USB ports plug into — different pin layouts for USB 2.0 vs USB 3.0 headers."},
  {name:"Fan header (CPU_FAN / SYS_FAN)",desc:"3-pin (voltage-controlled) or 4-pin (PWM-controlled) connector for case and CPU fans, allowing the motherboard to control fan speed."},
  {name:"CMOS battery",desc:"Small coin-cell battery that keeps BIOS/UEFI settings and the system clock alive when the PC is unplugged. A dead one causes the clock to reset and BIOS settings to revert to default."},
];
const BIOS_SECURITY_SETTINGS=[
  {setting:"Boot/BIOS password",desc:"Requires a password just to enter BIOS/UEFI setup, or even to boot the machine at all — prevents unauthorized changes to boot order or security settings."},
  {setting:"USB permissions",desc:"BIOS/UEFI can disable USB ports entirely or restrict them to prevent booting from USB drives or connecting unauthorized storage devices."},
  {setting:"TPM",desc:"Trusted Platform Module — a dedicated security chip that stores encryption keys. Can usually be enabled/disabled and cleared from BIOS/UEFI."},
  {setting:"Fan/thermal monitoring",desc:"BIOS/UEFI displays real-time fan speeds and temperatures, and can set custom fan curves."},
  {setting:"Secure Boot",desc:"Only allows cryptographically signed operating systems and bootloaders to load — blocks boot-level malware/rootkits from loading before the OS."},
  {setting:"HSM",full:"Hardware Security Module",desc:"A dedicated physical device (separate from the motherboard's TPM) that securely generates, stores, and manages encryption keys — used in higher-security enterprise environments, like protecting a certificate authority's private keys."},
];

const EXPANSION_SLOTS=[
  {slot:"PCIe x1",desc:"Smallest PCIe slot. Used for lower-bandwidth cards like sound cards, low-end network cards, or USB expansion cards."},
  {slot:"PCIe x4",desc:"Mid-size slot, sometimes used for additional M.2 NVMe adapters or capture cards."},
  {slot:"PCIe x8",desc:"Less common size — sometimes physically x16 length but only wired with x8 lanes."},
  {slot:"PCIe x16",desc:"The largest, fastest slot — almost always used for the graphics card (GPU). Provides the most bandwidth."},
  {slot:"M.2 slot",desc:"Small flat slot directly on the motherboard for NVMe SSDs or Wi-Fi cards — no cables needed at all, the drive plugs straight in."},
  {slot:"PCI (legacy)",desc:"Older expansion slot standard, mostly replaced by PCIe. Rarely found on modern motherboards but occasionally still seen on older workstations or specialty hardware."},
];

const RAID=[
  {level:"RAID 0",name:"Striping",min:2,fault:false,cap:"100% (full speed)",perf:"Best read/write",desc:"Data split across drives in alternating blocks. ONE drive fails = ALL data is permanently lost. No parity, no redundancy whatsoever.",use:"Video editing, scratch disks — speed only"},
  {level:"RAID 1",name:"Mirroring",min:2,fault:true,cap:"50% usable",perf:"Good read, same write",desc:"Exact byte-for-byte copy on each drive simultaneously. Either drive can fail without data loss. Simple, reliable.",use:"OS drives, critical data — simple redundancy"},
  {level:"RAID 5",name:"Stripe + Parity",min:3,fault:true,cap:"N−1 drives usable",perf:"Good read, moderate write",desc:"Data and parity striped across all drives. Can survive exactly ONE drive failure. Parity allows reconstruction. Requires 3+ drives.",use:"File servers — balanced performance and safety"},
  {level:"RAID 6",name:"Double Parity",min:4,fault:true,cap:"N−2 drives usable",perf:"Good read, slower write",desc:"Two independent parity blocks. Survives TWO simultaneous drive failures. Write penalty is higher than RAID 5.",use:"High-availability — critical production"},
  {level:"RAID 10",name:"Stripe of Mirrors",min:4,fault:true,cap:"50% usable",perf:"Best read/write",desc:"Pairs of RAID 1 mirrors, then RAID 0 across the pairs. Fast AND redundant. Can lose one drive per mirrored pair. Best of both worlds.",use:"Databases, busy servers — premium choice"},
];

const WIRELESS=[
  {std:"802.11a",wifi:"—",freq:"5 GHz",speed:"54 Mbps",notes:"Early 5GHz standard. Short range. Mostly obsolete.",legacy:true},
  {std:"802.11b",wifi:"—",freq:"2.4 GHz",speed:"11 Mbps",notes:"First widespread Wi-Fi. Very slow. Obsolete.",legacy:true},
  {std:"802.11g",wifi:"—",freq:"2.4 GHz",speed:"54 Mbps",notes:"Backward compatible with b. Still seen in older equipment.",legacy:true},
  {std:"802.11n",wifi:"Wi-Fi 4",freq:"2.4 + 5 GHz",speed:"600 Mbps",notes:"First dual-band. MIMO (multiple antennas). Still very common."},
  {std:"802.11ac",wifi:"Wi-Fi 5",freq:"5 GHz only",speed:"3.5 Gbps",notes:"5 GHz ONLY. MU-MIMO, beamforming. Very common currently."},
  {std:"802.11ax",wifi:"Wi-Fi 6/6E",freq:"2.4 + 5 + 6 GHz",speed:"9.6 Gbps",notes:"OFDMA, BSS coloring, better in dense areas. Wi-Fi 6E adds 6 GHz."},
  {std:"802.11be",wifi:"Wi-Fi 7",freq:"2.4 + 5 + 6 GHz",speed:"46 Gbps",notes:"NEW — Multi-Link Operation (MLO). Lowest latency."},
];

// ─── OTHER WIRELESS TECHNOLOGIES (Official Objective 2.2 — beyond 802.11 Wi-Fi) ───
const OTHER_WIRELESS_TECH=[
  {name:"Bluetooth",range:"~10 m (30 ft)",desc:"Short-range wireless for peripherals — headphones, keyboards, mice, file transfer between paired devices."},
  {name:"NFC",full:"Near-Field Communication",range:"~4 cm (a couple inches)",desc:"Extremely short range, used for tap-to-pay (Apple Pay/Google Pay) and quick device pairing."},
  {name:"RFID",full:"Radio-Frequency Identification",range:"Varies — cm to several meters depending on tag type",desc:"Uses radio waves to identify and track tags attached to objects — badge access systems, inventory tracking, and toll passes are common real-world examples. Passive RFID tags have no battery and are powered by the reader's signal; active tags have their own power source and much longer range."},
];

const WIN_EDITIONS=[
  {ed:"Windows 10/11 Home",features:["Consumer features","Microsoft Store","Windows Hello","Device Encryption (separate feature, NOT BitLocker)","No domain join","No gpedit.msc","No Remote Desktop HOST (can connect as client)"]},
  {ed:"Windows 10/11 Pro",features:["Everything in Home +","BitLocker full encryption","Domain join","gpedit.msc (Group Policy)","Remote Desktop HOST","Hyper-V virtualization","Windows Sandbox","Assigned Access"]},
  {ed:"Windows 11 Pro for Workstations",features:["A Pro VARIANT for high-end hardware (not a separate CompTIA-tested tier — official objectives list Home/Pro/Enterprise)","Everything in Pro +","ReFS file system support","Persistent memory (NVDIMM)","SMB Direct (RDMA) faster file sharing","Supports up to 4 CPUs and 6TB RAM"]},
  {ed:"Windows 10/11 Enterprise",features:["Everything in Pro +","DirectAccess VPN","AppLocker","Credential Guard","Windows To Go (Win10)","Volume licensing","BranchCache","Microsoft Defender for Endpoint"]},
];

// ─── DOMAIN VS WORKGROUP (Official Objective 1.7) ────────────────────────────
const DOMAIN_VS_WORKGROUP=[
  {model:"Workgroup",desc:"Peer-to-peer network model — every computer manages its own local user accounts and permissions independently. No central authority. Fine for a home or very small office.",traits:["Each PC has its own local accounts","No centralized control","Shared resources (files/printers) set up individually on each PC","Simple, but doesn't scale past a handful of computers"]},
  {model:"Domain",desc:"Centralized network model — a domain controller (running Active Directory) manages user accounts, permissions, and policy for every computer that joins. Standard for businesses of any real size.",traits:["Centralized accounts — log in with the same credentials on any joined PC","Group Policy pushes settings/restrictions to all domain computers at once","Centralized file servers and mapped network drives","Requires Windows Pro/Enterprise to join — Home cannot"]},
];

// ─── OS TYPES COMPLETENESS (Core 2 objective 1.1) ────────────────────────────
const OS_TYPES=[
  {type:"Windows",cat:"Workstation OS",desc:"Microsoft's desktop/laptop OS — the most common workstation OS tested on the exam."},
  {type:"Linux",cat:"Workstation OS",desc:"Open-source OS, many distributions (Ubuntu, Fedora, etc). Command-line heavy — see the Linux commands section."},
  {type:"macOS",cat:"Workstation OS",desc:"Apple's desktop/laptop OS, Unix-based under the hood — many Linux commands work in its Terminal too."},
  {type:"Chrome OS",cat:"Workstation OS",desc:"Google's lightweight, browser-centric OS used on Chromebooks. Runs Android and Linux apps in addition to web apps. Minimal local storage needs since most work happens in the cloud."},
  {type:"iPadOS",cat:"Mobile OS",desc:"Apple's tablet-optimized OS, based on iOS but with multitasking features suited to a larger touchscreen."},
  {type:"iOS",cat:"Mobile OS",desc:"Apple's OS for iPhones."},
  {type:"Android",cat:"Mobile OS",desc:"Google's OS for phones/tablets, open-source based, used by many manufacturers (Samsung, Google Pixel, etc)."},
];
const OS_LIFECYCLE=[
  {term:"End-of-Life (EOL)",desc:"The point at which a vendor stops all support for an OS version — no more security patches, meaning continued use becomes a real security risk."},
  {term:"Update limitations",desc:"Some hardware can't run the latest OS updates due to missing required features (like TPM 2.0 for Windows 11), even if the OS itself would otherwise support it."},
  {term:"Compatibility concerns between OSes",desc:"Software written for one OS often won't run natively on another (a Windows .exe won't run on macOS) — a key consideration before deploying new applications."},
];
const WIN_N_VERSIONS=[
  {term:"N versions (Windows)",desc:"Editions of Windows sold in Europe/Korea with Windows Media Player and some other bundled media technologies removed, due to regional antitrust regulations. Functionally identical otherwise."},
];

const WINDOWS_INSTALL_COMPLETE=[
  {term:"Multiboot",desc:"Installing more than one operating system on the same computer, with a boot menu letting the user choose which one to start at power-on."},
  {term:"Recovery partition",desc:"A hidden partition on the drive containing factory-reset files, letting a user restore the OS to its original state without needing separate installation media."},
  {term:"Third-party drivers (install consideration)",desc:"During installation, certain hardware (especially storage controllers like RAID) may need a driver loaded manually before the installer can even see the drive."},
  {term:"Feature updates / Product life cycle",desc:"Major Windows updates (twice yearly) that add new features, distinct from smaller monthly security-only updates. Each release has its own defined support end date as part of the product life cycle."},
];

const MALWARE=[
  {type:"Virus",desc:"Attaches to legitimate files. Replicates when infected file runs. Requires user action to spread.",fix:"Antivirus scan, delete infected files, restore from backup."},
  {type:"Worm",desc:"Self-replicating — spreads across networks WITHOUT needing a host file or user action.",fix:"Patch OS, isolate infected systems, network segmentation."},
  {type:"Trojan",desc:"Disguised as legitimate software. Creates a backdoor. Does NOT self-replicate.",fix:"Remove malware, restore from clean backup, change credentials."},
  {type:"Ransomware",desc:"Encrypts user files and demands payment (usually crypto). Critical business threat.",fix:"RESTORE FROM BACKUP. Never pay ransom. Isolate affected systems."},
  {type:"Boot Sector Virus",desc:"Infects the Master Boot Record so it runs before the operating system even loads, making it very hard to remove with normal antivirus.",fix:"Boot from external rescue media, use bootrec commands to repair MBR, run an offline/bootable antivirus scan."},
  {type:"Cryptominer",desc:"Secretly uses the infected device's CPU/GPU resources to mine cryptocurrency for the attacker — causes major slowdowns and overheating.",fix:"Identify and kill the mining process, remove the malware, monitor for unusually high CPU/GPU usage going forward."},
  {type:"Stalkerware",desc:"Covertly installed spyware specifically used to monitor a person's activity, location, and communications — often used in personal/domestic abuse situations.",fix:"Full device scan and factory reset, change all account passwords from a separate clean device."},
  {type:"Fileless Malware",desc:"Runs entirely in memory using legitimate system tools (like PowerShell) instead of writing a traditional file to disk — evades file-based antivirus detection.",fix:"Behavior-based EDR/XDR tools, memory analysis, restrict script execution policies."},
  {type:"Spyware",desc:"Secretly monitors user activity, collects data, keystrokes, screenshots.",fix:"Anti-spyware tools, check startup/browser extensions, reimage."},
  {type:"Adware",desc:"Displays unwanted advertisements. Often bundled with free software.",fix:"Uninstall suspicious software, clean browser extensions and cache."},
  {type:"Rootkit",desc:"Hides itself and other malware from the OS. Extremely difficult to detect.",fix:"Bootable offline antivirus scanner (can't scan running OS)."},
  {type:"Keylogger",desc:"Records every keystroke — captures passwords, credit cards, private data.",fix:"Antivirus scan, check running processes, change all passwords."},
  {type:"Botnet",desc:"Group of compromised devices (bots) controlled by attacker's C2 server. Used for DDoS, spam.",fix:"Full system wipe, patch vulnerabilities, update credentials."},
  {type:"Phishing",desc:"Fake emails/websites designed to steal credentials or install malware.",fix:"User training, email filtering (SPF/DKIM/DMARC), MFA."},
  {type:"Vishing",desc:"Voice/phone phishing — caller impersonates IT support, bank, etc.",fix:"Always verify caller identity. Call back official number."},
  {type:"Smishing",desc:"SMS/text phishing — malicious links in text messages.",fix:"Never click links in unsolicited text messages."},
  {type:"Tailgating/Piggybacking",desc:"Following authorized person through secured door without badging in.",fix:"Security awareness training, mantrap/airlock doors, badges."},
  {type:"Shoulder Surfing",desc:"Watching someone's screen or keyboard to steal information.",fix:"Privacy screens, awareness training, position screen away from view."},
  {type:"Dumpster Diving",desc:"Searching trash for sensitive documents, credentials, hardware.",fix:"Shred all documents, degauss/wipe drives before disposal."},
  {type:"Man-in-the-Middle",desc:"Attacker intercepts communication between two parties without their knowledge.",fix:"HTTPS everywhere, certificate pinning, verify certificates."},
  {type:"DoS / DDoS",desc:"Overwhelms target with traffic to deny service. DDoS = multiple sources.",fix:"Firewall rate limiting, CDN, scrubbing service, ISP-level mitigation."},
  {type:"Brute Force",desc:"Tries all possible password combinations systematically until one works.",fix:"Account lockout policy, strong passwords, MFA."},
  {type:"Dictionary Attack",desc:"Uses a list of common words and known passwords to guess credentials.",fix:"Unique complex passwords, MFA, password manager."},
  {type:"Evil Twin AP",desc:"Rogue Wi-Fi access point with same SSID as legitimate network.",fix:"Verify AP certificates, use HTTPS, VPN on public Wi-Fi."},
  {type:"Zero-Day",desc:"Exploit targeting an unknown or unpatched vulnerability. No patch available yet.",fix:"Defense in depth, anomaly detection, isolate critical systems."},
  {type:"SQL Injection",desc:"Malicious SQL code injected into input fields to manipulate database.",fix:"Input validation, parameterized queries, web application firewall."},
  {type:"Insider Threat",desc:"A current or former employee, contractor, or partner who misuses their legitimate access to harm the organization — intentionally or accidentally.",fix:"Least privilege, offboarding procedures, activity monitoring, background checks."},
  {type:"On-Path Attack",desc:"Modern name for Man-in-the-Middle — attacker positions themselves between two parties to intercept or alter communication.",fix:"HTTPS everywhere, certificate pinning, VPN on untrusted networks."},
  {type:"Watering Hole Attack",desc:"Attacker compromises a legitimate website that a specific target group is known to visit, infecting visitors rather than attacking the target directly.",fix:"Keep browsers/plugins patched, web filtering, endpoint protection."},
  {type:"Impersonation",desc:"Attacker pretends to be someone trusted (IT support, a vendor, an executive) to manipulate a victim into an action — the general category that vishing/phishing often fall under.",fix:"Verify identity through a separate channel before acting on any request."},
  {type:"QR Code Phishing",desc:"A malicious QR code redirects the scanner to a fake login page or triggers a malicious download — increasingly common since QR codes hide the actual destination URL until scanned.",fix:"Preview the URL before opening (many phone cameras show it), never enter credentials after scanning an unexpected QR code."},
  {type:"Whaling",desc:"A highly targeted phishing attack specifically aimed at senior executives ('the big fish') — often used to authorize fraudulent wire transfers.",fix:"Require secondary verification for large financial transactions regardless of who requests them, executive security awareness training."},
  {type:"Cross-Site Scripting (XSS)",desc:"Attacker injects malicious script into a trusted website, which then runs in other users' browsers when they visit — can steal session cookies or credentials.",fix:"Input sanitization, output encoding, Content Security Policy headers on the web application."},
  {type:"Supply Chain / Pipeline Attack",desc:"Attacker compromises a trusted third-party vendor or software update mechanism to distribute malware to that vendor's customers — bypasses direct defenses since the malicious code arrives through a trusted channel.",fix:"Vet third-party vendors, verify software signatures, monitor for unexpected behavior even from trusted sources."},
];

// Official 10-step malware removal process
const MALWARE_STEPS=[
  "1. Investigate and verify malware symptoms",
  "2. Quarantine the infected system (disconnect from network)",
  "3. Disable System Restore (in Windows Home)",
  "4. Remediate infected systems",
  "5. Update anti-malware software",
  "6. Scan and removal techniques (e.g., Safe Mode, preinstallation environment)",
  "7. Reimage/reinstall the OS if necessary",
  "8. Schedule scans and run updates",
  "9. Enable System Restore and create a restore point (in Windows Home)",
  "10. Educate the end user",
];
const MALWARE_DETECTION_TOOLS=[
  {name:"Recovery Console",desc:"A minimal command-line repair environment for a badly infected/damaged Windows install, used when the OS can't boot normally enough to run standard tools."},
  {name:"EDR",full:"Endpoint Detection and Response",desc:"Continuously monitors endpoint behavior (not just known virus signatures) to detect and respond to suspicious activity in real time."},
  {name:"MDR",full:"Managed Detection and Response",desc:"EDR-style monitoring, but outsourced to a third-party security team who watches and responds to alerts on the organization's behalf."},
  {name:"XDR",full:"Extended Detection and Response",desc:"Extends EDR beyond just endpoints — correlates data across endpoints, network, email, and cloud for a more complete detection picture."},
  {name:"Email security gateway",desc:"Filters incoming/outgoing email for malware, phishing, and spam before it reaches the inbox."},
  {name:"Software firewall",desc:"Firewall running as software on an individual device (like Windows Defender Firewall), rather than a dedicated hardware appliance."},
  {name:"Antiphishing training",desc:"User education specifically teaching employees to recognize and report phishing attempts — a key part of 'user education regarding common threats.'"},
];

const SUBNETS=[
  {cidr:"/8", mask:"255.0.0.0",     hb:24,total:"16,777,216",usable:"16,777,214"},
  {cidr:"/16",mask:"255.255.0.0",   hb:16,total:"65,536",    usable:"65,534"},
  {cidr:"/24",mask:"255.255.255.0", hb:8, total:"256",       usable:"254"},
  {cidr:"/25",mask:"255.255.255.128",hb:7,total:"128",       usable:"126"},
  {cidr:"/26",mask:"255.255.255.192",hb:6,total:"64",        usable:"62"},
  {cidr:"/27",mask:"255.255.255.224",hb:5,total:"32",        usable:"30"},
  {cidr:"/28",mask:"255.255.255.240",hb:4,total:"16",        usable:"14"},
  {cidr:"/29",mask:"255.255.255.248",hb:3,total:"8",         usable:"6"},
  {cidr:"/30",mask:"255.255.255.252",hb:2,total:"4",         usable:"2"},
  {cidr:"/31",mask:"255.255.255.254",hb:1,total:"2",         usable:"0 (P2P special)"},
  {cidr:"/32",mask:"255.255.255.255",hb:0,total:"1",         usable:"1 (host route)"},
];

const VPN_PROTOS=[
  {name:"IPsec",   secure:true, desc:"Layer 3 tunnel. Encrypts IP packets. Most secure. Used alone or with L2TP.",note:"AH for integrity, ESP for encryption"},
  {name:"SSL/TLS", secure:true, desc:"Layers 5–7. Browser-based. Uses HTTPS port 443. Easy firewall traversal.",note:"OpenVPN and modern SSL VPNs"},
  {name:"L2TP",    secure:false,desc:"Layer 2 tunnel — provides tunneling only. ZERO built-in encryption.",note:"⚠️ MUST pair with IPsec for security"},
  {name:"PPTP",    secure:false,desc:"Microsoft legacy VPN. Fast but uses weak encryption (MS-CHAP v2).",note:"⚠️ Broken — avoid in all new deployments",legacy:true},
  {name:"OpenVPN", secure:true, desc:"Open-source SSL/TLS-based VPN. Port 1194 UDP. Very secure and flexible.",note:"Cross-platform, widely trusted"},
  {name:"WireGuard",secure:true,desc:"Modern lightweight VPN. Tiny codebase (~4000 lines). Faster than OpenVPN.",note:"NEW on 220-1201/1202 — know this"},
  {name:"Split Tunneling",secure:null,desc:"Only company-bound traffic goes through VPN. Other traffic exits directly.",note:"Saves bandwidth but reduces security"},
];

const CLOUD=[
  {model:"IaaS",full:"Infrastructure as a Service",desc:"Raw compute, storage, networking. YOU manage OS and everything above.",ex:"AWS EC2, Azure VMs, Google Compute",color:T.red},
  {model:"PaaS",full:"Platform as a Service",desc:"Provider manages OS and runtime. YOU manage applications and data only.",ex:"Heroku, Google App Engine, Azure App Service",color:T.yellow},
  {model:"SaaS",full:"Software as a Service",desc:"Provider manages everything. YOU just log in and use the application.",ex:"Microsoft 365, Google Workspace, Salesforce",color:T.green},
  {model:"Public",full:"Public Cloud",desc:"Shared multi-tenant infrastructure. Internet-accessible. Pay-as-you-go.",ex:"AWS, Microsoft Azure, Google Cloud",color:T.accent},
  {model:"Private",full:"Private Cloud",desc:"Dedicated infrastructure for one organization. On-premises or co-located.",ex:"VMware vCloud, OpenStack",color:T.purple},
  {model:"Hybrid",full:"Hybrid Cloud",desc:"Mix of public and private. Data and apps move between environments.",ex:"Azure Hybrid, AWS Outposts",color:T.cyan},
  {model:"Community",full:"Community Cloud",desc:"Shared by SEVERAL organizations with common needs/requirements (government, healthcare) — NOT open to the general public like a public cloud.",ex:"FedRAMP cloud, healthcare clouds",color:T.muted},
];

// ─── WHO MANAGES WHAT — THE CLASSIC IaaS/PaaS/SaaS EXAM VISUAL ──────────────
const CLOUD_RESPONSIBILITY=[
  {layer:"Application",onprem:"You",iaas:"You",paas:"You",saas:"Provider"},
  {layer:"Data",onprem:"You",iaas:"You",paas:"You",saas:"You (usually)"},
  {layer:"Runtime",onprem:"You",iaas:"You",paas:"Provider",saas:"Provider"},
  {layer:"Middleware",onprem:"You",iaas:"You",paas:"Provider",saas:"Provider"},
  {layer:"OS",onprem:"You",iaas:"You",paas:"Provider",saas:"Provider"},
  {layer:"Virtualization",onprem:"You",iaas:"Provider",paas:"Provider",saas:"Provider"},
  {layer:"Servers/Storage/Networking",onprem:"You",iaas:"Provider",paas:"Provider",saas:"Provider"},
];

// ─── CLOUD CHARACTERISTICS (Official Objective 4.2 — often tested, often skipped) ───
const CLOUD_CHARACTERISTICS=[
  {term:"Metered Utilization",desc:"You pay based on actual usage, not a flat fee — like a utility bill. Covers ingress (data coming IN, often free) and egress (data going OUT, often the cost that surprises people)."},
  {term:"High Availability",desc:"The cloud service is designed to stay up and reachable with very little downtime, usually expressed as a percentage (like 99.99% = 'four nines'). Achieved through redundancy — no single point of failure."},
  {term:"Scalability",desc:"The ability to increase (scale up/out) or decrease (scale down/in) resources to meet demand. Unlike elasticity, scaling doesn't have to be automatic or instant — it's the general capability to grow or shrink."},
  {term:"Rapid Elasticity",desc:"The cloud automatically and QUICKLY scales resources up or down based on real-time demand — e.g., a website automatically gets more server capacity during a traffic spike, then scales back down within minutes. The key word is RAPID — this is scalability that happens fast and often automatically."},
  {term:"Shared Resources",desc:"Multiple customers ('tenants') share the same underlying physical cloud infrastructure while their data and resources stay logically isolated from each other — this is also called multitenancy."},
  {term:"File synchronization",desc:"Automatically keeping files updated and consistent across multiple devices and the cloud — e.g., OneDrive or Dropbox syncing a folder everywhere."},
];

const VIRT_TYPES=[
  {name:"Type 1 Hypervisor",desc:"Bare-metal — runs DIRECTLY on hardware. No host OS required. Most efficient.",ex:"VMware ESXi, Microsoft Hyper-V, Xen"},
  {name:"Type 2 Hypervisor",desc:"Hosted — runs ON TOP of a host OS. Easier to set up. Slight overhead.",ex:"VMware Workstation, VirtualBox, Parallels"},
  {name:"Container",desc:"Shares host OS kernel. Lightweight, fast startup, isolated processes.",ex:"Docker, Kubernetes pods"},
  {name:"VDI",desc:"Virtual Desktop Infrastructure. Centrally hosted desktop VMs users connect to remotely.",ex:"VMware Horizon, Citrix, Azure Virtual Desktop"},
  {name:"VM Snapshot",desc:"Saved VM state at a point in time. Can roll back instantly. Common before risky changes.",ex:"VMware, VirtualBox, Hyper-V snapshots"},
  {name:"Live Migration",desc:"Move a running VM between physical hosts with zero downtime.",ex:"VMware vMotion, Hyper-V Live Migration"},
  {name:"Sandbox",desc:"Isolated environment to run untrusted code without affecting host.",ex:"Windows Sandbox, Cuckoo, Bromium"},
];

// ─── PURPOSE OF VIRTUAL MACHINES (Official Objective 4.1 — named sub-bullets) ───
const VM_PURPOSES=[
  {purpose:"Sandbox",desc:"Isolated space to safely test or run untrusted/risky software without any chance of it affecting the real host system."},
  {purpose:"Test development",desc:"Spin up a clean, disposable environment to build and test software before it ever touches production systems."},
  {purpose:"Application virtualization — legacy software/OS",desc:"Run an old application that needs an outdated OS (e.g., a Windows XP-only program) inside a VM on modern hardware, without installing that old OS directly on the physical machine."},
  {purpose:"Application virtualization — cross-platform",desc:"Run software built for a different OS entirely — e.g., running a Windows-only application on a Mac by running a Windows VM on top of macOS."},
];
const VM_REQUIREMENTS=[
  {req:"Security",desc:"VMs must be patched and secured just like physical machines — a compromised VM is a real security risk, not a 'safe sandbox' by default."},
  {req:"Network",desc:"VMs need proper virtual networking configuration (virtual switches, NAT, bridged mode) to communicate with the host, other VMs, and the outside network correctly."},
  {req:"Storage",desc:"VMs need adequate disk space allocated — both for the VM's virtual disk and for the host to have room for snapshots, which can grow large over time."},
];

// ─── DNS RECORD TYPES (Official Objective 2.4) ───────────────────────────────
const DNS_RECORDS=[
  {record:"A",desc:"Maps a domain name directly to an IPv4 address. The most common and basic DNS record type."},
  {record:"AAAA",desc:"Maps a domain name to an IPv6 address — the IPv6 equivalent of an A record."},
  {record:"CNAME",full:"Canonical Name",desc:"An alias that points one domain name to another domain name (not directly to an IP). E.g., www.site.com → site.com."},
  {record:"MX",full:"Mail Exchanger",desc:"Specifies which mail server is responsible for accepting email for a domain. Can have priority values if multiple mail servers exist."},
  {record:"TXT",full:"Text",desc:"Holds arbitrary text data, most commonly used today for email spam/authenticity verification: SPF, DKIM, and DMARC records all live here."},
];
const EMAIL_AUTH_RECORDS=[
  {name:"SPF",full:"Sender Policy Framework",desc:"Lists which mail servers are authorized to send email on behalf of a domain — helps receiving servers reject spoofed email."},
  {name:"DKIM",full:"DomainKeys Identified Mail",desc:"Adds a cryptographic signature to outgoing email, letting the receiving server verify the message wasn't altered in transit and really came from the claimed domain."},
  {name:"DMARC",full:"Domain-based Message Authentication, Reporting, and Conformance",desc:"Tells receiving servers what to DO when SPF or DKIM checks fail (reject, quarantine, or allow) and provides reporting back to the domain owner."},
];

// ─── DHCP CONCEPTS (Official Objective 2.4) ──────────────────────────────────
const DHCP_CONCEPTS=[
  {term:"Lease",desc:"The amount of TIME a device is allowed to keep a DHCP-assigned IP address before it must renew or release it."},
  {term:"Reservation",desc:"Configuring DHCP to always assign the SAME IP address to a specific device (identified by its MAC address) every time it connects — useful for printers and servers."},
  {term:"Scope",desc:"The full RANGE of IP addresses a DHCP server is allowed to hand out on a given network segment."},
  {term:"Exclusion",desc:"Specific addresses WITHIN the scope that DHCP is told NOT to assign — usually because they're reserved for static-IP devices like routers or servers."},
];

// ─── PHYSICAL SECURITY (Official Objective 2.1) ──────────────────────────────
const PHYSICAL_SECURITY=[
  {item:"Bollards",desc:"Short, sturdy posts installed outside a building to physically block vehicles from ramming the entrance."},
  {item:"Access control vestibule",desc:"A small interlocking double-door chamber (a.k.a. mantrap) — the first door must close before the second opens, preventing tailgating and controlling exactly who enters."},
  {item:"Badge reader",desc:"Scans an employee ID badge to unlock a door or log entry — often paired with a PIN or biometric for two-factor physical access."},
  {item:"Video surveillance",desc:"Cameras monitoring and recording physical spaces — deters intrusion and provides evidence after an incident."},
  {item:"Alarm systems",desc:"Trigger an audible or silent alert when a security breach (like a forced door) is detected."},
  {item:"Motion sensors",desc:"Detect unauthorized movement in a secured area and trigger an alert."},
  {item:"Door locks",desc:"Basic physical locks — the foundational layer of physical security, ranging from simple key locks to electronic keypad locks."},
  {item:"Equipment locks",desc:"Physical locks (like cable locks) that secure laptops or hardware to a desk, preventing theft."},
  {item:"Security guards",desc:"Human personnel providing active monitoring, access verification, and response — the most flexible but also most expensive physical security control."},
  {item:"Fences",desc:"Perimeter barriers that establish and enforce a physical boundary around a facility, often the first layer of physical security."},
  {item:"Magnetometers",desc:"Metal detectors — screen people entering a facility for concealed weapons or unauthorized metal objects."},
];
const PHYSICAL_ACCESS_METHODS=[
  {method:"Key fobs / Smart cards / Mobile digital key",desc:"Physical or digital credentials that grant access when presented to a reader — modern alternative to traditional metal keys."},
  {method:"Retina / Fingerprint / Palm print scanner",desc:"Biometric authentication methods using unique physical traits — hard to fake, but not impossible, and can't be 'reset' if compromised the way a password can."},
  {method:"Facial recognition technology (FRT)",desc:"Identifies a person by analyzing facial features captured by a camera."},
  {method:"Voice recognition technology",desc:"Identifies a person by the unique characteristics of their voice."},
  {method:"Lighting",desc:"Well-lit areas discourage intrusion attempts and improve the effectiveness of video surveillance — a simple but genuinely tested physical security control."},
];

// ─── WINDOWS ENCRYPTION & WORKSTATION HARDENING (Official Objectives 2.2/2.7) ───
const WINDOWS_ENCRYPTION=[
  {name:"BitLocker",desc:"Full-disk encryption for internal drives. Requires TPM (or a USB startup key as a workaround). Windows Pro/Enterprise only."},
  {name:"BitLocker To Go",desc:"The same BitLocker encryption technology, but applied to REMOVABLE drives — USB flash drives and external hard drives — so they're unreadable if lost or stolen."},
  {name:"EFS",full:"Encrypting File System",desc:"Encrypts individual files or folders (not the whole drive) for the currently logged-in user, transparently — no TPM required. Different scope than BitLocker."},
  {name:"Encryption at rest",desc:"The general principle of keeping stored data encrypted, whether that's a full disk (BitLocker), individual files (EFS), or a database — as opposed to encryption 'in transit' while data is being sent over a network."},
];
const WORKSTATION_HARDENING=[
  {setting:"Password complexity",desc:"Requiring passwords to include a mix of length, uppercase/lowercase, numbers, and symbols — makes brute-force and dictionary attacks significantly harder."},
  {setting:"Password expiration",desc:"Forcing periodic password changes — a control that's become less universally recommended over time (frequent forced changes can lead to weaker, more predictable passwords) but is still tested."},
  {setting:"Screensaver / screen lock",desc:"Automatically locking the screen after a period of inactivity, requiring re-authentication — prevents someone from walking up to an unattended unlocked PC."},
  {setting:"Disable AutoRun/AutoPlay",desc:"Prevents removable media (USB drives, CDs) from automatically executing programs the instant they're inserted — a classic malware infection vector if left enabled."},
  {setting:"Disable unused services",desc:"Turning off Windows services that aren't needed reduces the attack surface — fewer running services means fewer potential vulnerabilities."},
  {setting:"Account lockout policy",desc:"Automatically locks an account after a set number of failed login attempts, slowing down brute-force password-guessing attacks."},
];

// ─── LOGICAL SECURITY CONCEPTS (Official Objective 2.1) ─────────────────────
const LOGICAL_SECURITY=[
  {term:"Principle of Least Privilege",desc:"Give users ONLY the minimum access needed to do their job — nothing more. Limits the blast radius if an account is ever compromised."},
  {term:"Zero Trust model",desc:"Never trust, always verify — no implicit trust based on network location, even for users already inside the network perimeter."},
  {term:"Access Control Lists (ACLs)",desc:"Rules attached to a resource (file, folder, network device) explicitly defining which users/groups can access it and what they're allowed to do."},
  {term:"Just-in-time access",desc:"Users are granted elevated/privileged access only for the specific time window they need it, then it's automatically revoked — reduces the window an attacker could exploit standing admin rights."},
  {term:"Privileged Access Management (PAM)",desc:"A system for managing, monitoring, and tightly controlling accounts with elevated privileges (like domain admins) — often paired with just-in-time access."},
  {term:"SAML",full:"Security Assertions Markup Language",desc:"An XML-based standard that lets identity providers pass authentication/authorization data to service providers — a common technology behind Single Sign-On."},
  {term:"Single Sign-On (SSO)",desc:"Log in once, and that authentication carries over to multiple connected applications/services without logging in again separately for each one."},
  {term:"Identity Access Management (IAM)",desc:"The broader framework/system an organization uses to manage digital identities and control what resources each identity can access."},
  {term:"Directory services",desc:"A centralized database of users, computers, and resources (like Active Directory) that other systems query for authentication and authorization decisions."},
];

// ─── WINDOWS ACCOUNT TYPES (Official Objective 2.2) ──────────────────────────
const WIN_ACCOUNT_TYPES=[
  {type:"Local account",desc:"Exists only on that specific machine — no cloud sync, no Microsoft account tie-in."},
  {type:"Microsoft account",desc:"Signs in with an email-based Microsoft account — syncs settings, files, and app licenses across devices."},
  {type:"Standard account",desc:"Can use installed software and change some settings, but cannot install new software or make system-wide changes without admin approval."},
  {type:"Administrator account",desc:"Full control over the system — can install software, change any setting, and manage other user accounts."},
  {type:"Guest account",desc:"A limited, temporary account with minimal permissions and no persistent settings — should be disabled by default as a security best practice."},
  {type:"Power user",desc:"A legacy Windows account tier with more rights than Standard but less than full Administrator — largely phased out in modern Windows in favor of just Standard/Admin."},
];

// ─── WINDOWS SETTINGS — FULL NAMED LIST (Official Objective 1.6) ────────────
const WIN_SETTINGS_LIST=[
  "Internet Options","Devices and Printers","Programs and Features","Network and Sharing Center",
  "System","Windows Defender Firewall","Mail","Sound","User Accounts","Device Manager",
  "Indexing Options","Administrative Tools","File Explorer Options","Power Options",
  "Ease of Access","Time and Language","Update and Security","Personalization",
  "Apps","Privacy","Devices","Network and Internet","Gaming","Accounts",
];
const WIN_SETTINGS_DEPTH=[
  {setting:"Indexing Options",desc:"Controls which folders/files Windows Search actively indexes for fast search results — excluding folders speeds up indexing but makes those files unsearchable quickly."},
  {setting:"Ease of Access",desc:"Accessibility settings — screen reader (Narrator), magnifier, high contrast, closed captions, and other accommodations for users with disabilities."},
  {setting:"File Explorer Options",desc:"Controls view hidden files, hide/show file extensions, and general folder browsing behavior."},
];
const POWER_OPTIONS_DEPTH=[
  {term:"Hibernate",desc:"Saves the current session to the HARD DRIVE and fully powers off — slower to resume than sleep, but uses zero power while off and survives a battery drain."},
  {term:"Sleep/Suspend/Standby",desc:"Saves the current session to RAM and drops into very low power mode — near-instant resume, but still draws a small amount of power and session is lost if battery fully drains."},
  {term:"Power plans",desc:"Predefined power-usage profiles (Balanced, Power Saver, High Performance) that adjust CPU speed, screen brightness, and sleep timers automatically."},
  {term:"Choose what closing the lid does",desc:"Configurable laptop setting — closing the lid can sleep, hibernate, shut down, or do nothing, independent of the power button's behavior."},
  {term:"Turn on fast startup",desc:"Hybrid shutdown mode that hibernates the kernel session to speed up the next boot — NOT the same as a full shutdown, which can cause issues with dual-boot systems or certain driver updates."},
  {term:"USB selective suspend",desc:"Allows Windows to power down individual USB ports when not in use to save battery — can occasionally cause USB devices to disconnect unexpectedly if misconfigured."},
];

// ─── ROUTER/WIRELESS SECURITY COMPLETENESS (Official Objective 2.10) ────────
const ROUTER_SECURITY_EXTRA=[
  {term:"UPnP",full:"Universal Plug and Play",desc:"Lets devices automatically open ports on the router without manual configuration — convenient but a security risk, since malware can also exploit UPnP to open ports. Best practice: disable it."},
  {term:"Screened subnet",desc:"A separate network segment (sometimes still called a DMZ) that sits between the internet and the internal network, hosting public-facing services in isolation so a compromise there doesn't directly expose the internal LAN."},
  {term:"Port forwarding/mapping",desc:"Manually configuring the router to send traffic on a specific external port to a specific internal device/port — needed to host a service (like a game server) from behind NAT."},
  {term:"IP filtering",desc:"Allows or blocks traffic based on source/destination IP address."},
  {term:"Content filtering",desc:"Blocks access to specific websites or categories of content, often used for parental controls or workplace policy enforcement."},
];

// ─── ACTIVE DIRECTORY DEPTH (Official Objective 2.2) ─────────────────────────
const ACTIVE_DIRECTORY=[
  {term:"Joining a domain",desc:"Connects a Windows machine to a centrally-managed Active Directory network, letting domain admins control policy, authentication, and resources for that machine."},
  {term:"Login script",desc:"A script automatically run when a user logs in, often used to map network drives or apply settings consistently."},
  {term:"Organizational Units (OUs)",desc:"Containers within Active Directory used to organize users/computers/groups logically (e.g., by department) — Group Policy is typically applied at the OU level."},
  {term:"Home folders",desc:"A personal network storage folder automatically assigned and mapped to each user, following them regardless of which domain computer they log into."},
  {term:"Group Policy",desc:"Centrally-defined rules and configurations pushed out to domain-joined computers and users — covers everything from password requirements to desktop restrictions."},
  {term:"Security groups",desc:"Collections of user accounts that can be granted permissions collectively, rather than assigning permissions to each user individually."},
  {term:"Folder redirection",desc:"Redirects a user's local folders (like Documents or Desktop) to a network location instead, so their files follow them to any domain computer and get backed up centrally."},
];

// ─── DATA DESTRUCTION & DISPOSAL (Official Objective 2.9) ────────────────────
const DATA_DESTRUCTION=[
  {method:"Drilling",desc:"Physically drilling holes through a hard drive's platters — destroys the drive's ability to be read, but some data recovery may still theoretically be possible on undamaged sectors.",category:"Physical destruction"},
  {method:"Shredding",desc:"Feeding the entire drive through an industrial shredder that turns it into small metal fragments — the most thorough physical destruction method.",category:"Physical destruction"},
  {method:"Degaussing",desc:"Uses a powerful magnetic field to scramble the magnetic data on an HDD's platters. Does NOT work on SSDs, which don't store data magnetically.",category:"Physical destruction"},
  {method:"Incineration",desc:"Burning the drive completely — total destruction, but requires proper facilities and environmental compliance.",category:"Physical destruction"},
  {method:"Erasing/wiping",desc:"Software-based overwriting of all data (often multiple passes) so the drive can be safely reused or donated.",category:"Recycling/repurposing"},
  {method:"Low-level formatting",desc:"A deeper format that resets the drive's actual sector structure, not just the file system's index of what's there.",category:"Recycling/repurposing"},
  {method:"Standard formatting",desc:"The everyday 'format drive' option — clears the file system's index. NOT secure on its own since underlying data often remains recoverable.",category:"Recycling/repurposing"},
];
const DATA_DESTRUCTION_OUTSOURCING=[
  {term:"Third-party vendor",desc:"Hiring a specialized company to handle secure destruction/recycling when an organization doesn't have the equipment or expertise in-house."},
  {term:"Certificate of destruction",desc:"Official documentation from the vendor confirming exactly what was destroyed, when, and how — provides an audit trail and legal proof of proper disposal."},
  {term:"Regulatory and environmental requirements",desc:"Data destruction must also comply with environmental regulations for e-waste disposal, not just security requirements for data destruction."},
];

// ─── LICENSING, DRM & INCIDENT RESPONSE (Official Objective 4.6) ────────────
const LICENSING_DRM=[
  {term:"Valid licenses",desc:"Using only properly licensed software — unlicensed/pirated software is both a legal risk and often a malware vector."},
  {term:"Perpetual license agreement",desc:"A one-time purchase that grants indefinite use of that specific software version — contrasts with subscription licensing, which expires if payments stop."},
  {term:"Personal-use vs corporate-use license",desc:"Many software licenses distinguish between personal/home use and business use, often at different price points — using a personal license for business purposes violates the EULA."},
  {term:"Open-source license",desc:"Source code is publicly available and may be freely used, modified, and redistributed — subject to the specific open-source license's terms (which vary)."},
  {term:"DRM",full:"Digital Rights Management",desc:"Technology that restricts how digital content (software, media) can be copied, shared, or used, enforcing the license terms technically rather than just legally."},
  {term:"NDA / MNDA",full:"Non-Disclosure Agreement / Mutual NDA",desc:"A legal agreement preventing parties from sharing confidential information. Mutual means both parties are bound, not just one."},
];
const INCIDENT_RESPONSE=[
  {term:"Chain of custody",desc:"A documented, unbroken record of who handled evidence, when, and how — required for evidence to be considered legally admissible if an incident leads to prosecution."},
  {term:"Order of volatility",desc:"When collecting evidence, capture the MOST volatile (fastest to disappear) data first: RAM contents before disk contents, active network connections before log files — because volatile data is lost first if the system is powered down."},
  {term:"Informing management/law enforcement",desc:"Serious incidents may legally require notifying law enforcement or specific regulatory bodies, in addition to internal management — know your organization's obligations before an incident happens."},
  {term:"Copy of drive (data integrity and preservation)",desc:"Investigators work from a forensic COPY of a drive, never the original — preserving the original's integrity in case it's needed as evidence."},
  {term:"Incident documentation",desc:"Detailed records of what happened, when, who was involved, and what actions were taken — essential both for legal purposes and for improving future incident response."},
];
const REGULATED_DATA=[
  {type:"Credit card payment information (PCI)",desc:"Payment card data is protected under PCI-DSS (Payment Card Industry Data Security Standard) — strict handling requirements apply."},
  {type:"Personal government-issued information",desc:"IDs, passports, Social Security numbers — highly sensitive data requiring strict access controls."},
  {type:"PII",full:"Personally Identifiable Information",desc:"Any data that could identify a specific individual — names, addresses, birthdates — subject to privacy regulations."},
  {type:"Healthcare data (PHI)",desc:"Protected Health Information is regulated (HIPAA in the US) with strict handling, storage, and disclosure requirements."},
  {type:"Data retention requirements",desc:"Regulations often dictate not just how to protect data, but how LONG it must be kept (or how long it CAN be kept) before required deletion."},
];

// ─── SOFTWARE TROUBLESHOOTING SYMPTOMS (Core 2 objectives 3.1–3.4, COMPLETE) ─
const WIN_OS_TROUBLESHOOT=[
  "Blue Screen of Death (BSOD)","Degraded performance","Boot issues","Frequent shutdowns",
  "Services not starting","Applications crashing","Low memory warnings","USB controller resource warnings",
  "System instability","No OS found","Slow profile load","Time drift",
];
const MOBILE_OS_TROUBLESHOOT=[
  "Application fails to launch","Application fails to close/crashes","Application fails to update","Application fails to install",
  "Slow to respond","OS fails to update","Battery life issues","Random reboots",
  "Connectivity issues (Bluetooth, Wi-Fi, NFC)","Screen does not autorotate",
];
const MOBILE_SECURITY_TROUBLESHOOT=[
  {cat:"Security concerns",items:["Application source/unofficial application stores","Developer mode","Root access/jailbreak","Unauthorized/malicious application (application spoofing)"]},
  {cat:"Common symptoms",items:["High network traffic","Degraded response time","Data-usage limit notification","Limited internet connectivity","No internet connectivity","High number of ads","Fake security warnings","Unexpected application behavior","Leaked personal files/data"]},
];
const PC_SECURITY_TROUBLESHOOT=[
  {cat:"Common symptoms",items:["Unable to access the network","Desktop alerts","False alerts regarding antivirus protection","Altered system or personal files (missing/renamed, inability to access)","Unwanted notifications within the OS","OS update failures"]},
  {cat:"Browser-related symptoms",items:["Random/frequent pop-ups","Certificate warnings","Redirection","Degraded browser performance"]},
];

// ─── CHANGE MANAGEMENT TYPES (Official Objective 4.2) ────────────────────────
const CHANGE_TYPES=[
  {type:"Standard change",desc:"Pre-approved, low-risk, routine change with an established procedure — e.g., a regular monthly patch cycle. Doesn't need fresh approval each time."},
  {type:"Normal change",desc:"A change that requires review and approval through the standard change management process before implementation — most changes fall into this category."},
  {type:"Emergency change",desc:"An urgent change needed to fix a critical issue (like an active security breach) — expedited approval process because waiting for the normal cycle isn't an option."},
];
const CHANGE_PROCESS_ELEMENTS=[
  {term:"Rollback plan",desc:"The predetermined steps to undo the change and restore the previous working state if something goes wrong. Must exist BEFORE implementing, not improvised after."},
  {term:"Backup plan",desc:"Ensuring a full backup exists before the change begins, so data/config can be restored even if the rollback plan itself fails."},
  {term:"Sandbox testing",desc:"Testing the change in an isolated, non-production environment first to catch problems before they can affect real users or systems."},
  {term:"Change freeze / Maintenance window",desc:"A scheduled block of time when changes ARE allowed (maintenance window) or explicitly NOT allowed (change freeze — often during critical business periods like holidays)."},
  {term:"Risk analysis",desc:"Assessing how likely a change is to cause problems and how severe the impact would be if it did — assigns a risk level (low/medium/high) that helps determine how much approval and testing the change needs."},
];

// ─── DOCUMENTATION & TICKETING (Official Objective 4.1) ─────────────────────
const DOCUMENTATION_SYSTEMS=[
  {term:"Ticketing system",desc:"Software that tracks IT support requests from creation to resolution — records who reported it, priority, assigned technician, and resolution notes."},
  {term:"CMDB",full:"Configuration Management Database",desc:"A centralized database recording every IT asset (hardware, software, and how they relate to each other) — the single source of truth for what exists on the network and how it's configured."},
  {term:"Asset tags / IDs",desc:"Unique identifiers (often barcode/QR labels) physically attached to hardware, used to track ownership, location, and lifecycle in inventory management."},
  {term:"Procurement life cycle",desc:"The full process of acquiring IT assets: identifying need → purchasing → deployment → maintenance → eventual retirement/disposal."},
  {term:"Warranty / Licensing / Certificate documentation",desc:"Records of what's still under warranty, which software licenses are owned and where they're deployed, and digital certificate expiration tracking."},
  {term:"Network topology diagram",desc:"A visual map of how network devices are physically and/or logically connected — essential for troubleshooting and planning changes."},
  {term:"SOPs",full:"Standard Operating Procedures",desc:"Documented step-by-step instructions for performing a recurring task consistently — e.g., a custom install procedure that ensures every new machine gets set up identically."},
  {term:"Onboarding checklist",desc:"A documented list of IT setup steps to complete when a new employee joins — accounts, hardware, access, and software provisioning."},
  {term:"Offboarding checklist",desc:"A documented list of IT steps to complete when an employee leaves — disabling accounts, retrieving hardware, revoking access — critical for security."},
  {term:"Regulatory compliance requirements",desc:"Industry-specific rules an organization must follow (like HIPAA for healthcare or PCI-DSS for payment card data) that shape IT policy and documentation needs."},
  {term:"Splash screen / Acceptable Use Policy (AUP)",desc:"A login banner or policy document defining what employees are and aren't allowed to do with company IT resources."},
  {term:"Knowledge base / Articles",desc:"A searchable internal repository of known issues and their solutions, letting technicians resolve repeat problems quickly instead of solving them from scratch each time."},
];

// ─── WINDOWS INSTALLATION & BOOT METHODS (Official Objective 1.2) ───────────
const WINDOWS_INSTALL_TYPES=[
  {type:"Clean install / Unattended install",desc:"Wipes the drive and installs Windows fresh. Unattended installs use a preset answer file to skip manual setup prompts entirely — common for mass deployment."},
  {type:"Upgrade",desc:"Installs a new Windows version while preserving existing files, settings, and applications from the current install."},
  {type:"Repair installation / In-place upgrade",desc:"Reinstalls Windows over itself to fix a corrupted system while keeping files and apps intact — used to fix an unhealthy install without a full wipe."},
  {type:"Image deployment",desc:"Applying a pre-configured, pre-built Windows image (with apps/settings already set up) to a new machine — much faster than a manual install for many computers at once."},
  {type:"Remote network installation",desc:"Installing Windows over the network to a machine, without physical installation media, often used with PXE boot."},
  {type:"Zero-touch / Self-deploying",desc:"A fully automated deployment where a new machine images itself with no technician interaction at all, often triggered the moment it connects to the network."},
];
const BOOT_METHODS=[
  {method:"USB",desc:"Boot the installer from a bootable USB flash drive — the most common method for a single machine today."},
  {method:"Optical media (DVD)",desc:"Boot from a physical installation disc — largely legacy now that most modern machines lack optical drives."},
  {method:"PXE",full:"Preboot Execution Environment",desc:"Boot directly over the network — the computer requests and downloads the OS installer from a network server, no physical media needed at all."},
  {method:"Internet-based",desc:"Boot and install directly using an internet connection to Microsoft's servers — Windows can rebuild/reset itself this way even with no local install media."},
  {method:"External/hot-swappable drive",desc:"Boot from an OS installed on an external drive connected via USB — useful for portable troubleshooting environments."},
];
const PARTITION_STYLES=[
  {style:"MBR",full:"Master Boot Record",desc:"Legacy partitioning scheme. Maximum of 4 primary partitions, maximum 2TB per partition. Works with BIOS or UEFI in legacy/compatibility mode.",legacy:true},
  {style:"GPT",full:"GUID (Globally Unique Identifier) Partition Table",desc:"Modern partitioning scheme. Up to 128 partitions, supports drives far larger than 2TB. Required for UEFI Secure Boot and Windows 11.",legacy:false},
];

const PROF_COMM=[
  {do:"Set clear expectations with timeframes","dont":"Make promises you cannot keep"},
  {do:"Active Listening — let customer finish speaking, confirm you understood","dont":"Interrupt or finish their sentences"},
  {do:"Use plain language appropriate to customer knowledge","dont":"Use technical jargon that confuses customers"},
  {do:"Offer options when possible","dont":"Make decisions for the customer without asking"},
  {do:"Follow up to verify solution works","dont":"Close ticket without confirming resolution"},
  {do:"Be on time; if late, call ahead","dont":"Be disrespectful of customer's time"},
  {do:"Respect privacy — don't share data","dont":"Read emails or files beyond what's needed"},
  {do:"Document everything — changes, findings, resolution","dont":"Rely on memory for change records"},
  {do:"Escalate when outside your knowledge","dont":"Guess at complex problems outside your expertise"},
  {do:"Maintain professional appearance and workspace","dont":"Leave tools or cables unorganized after visit"},
  {do:"Cultural Sensitivity — use appropriate professional titles and designations","dont":"Make assumptions or jokes based on a customer's background or culture"},
  {do:"Match required attire (formal or business casual) to the environment","dont":"Show up underdressed or overly casual for the workplace"},
];

const LICENSING=[
  {type:"EULA",full:"End-user License Agreement",desc:"Software license agreement you accept when installing. Defines permitted use, restrictions."},
  {type:"OEM",full:"Original Equipment Manufacturer",desc:"License tied to specific hardware. Cannot be transferred to different machine."},
  {type:"Retail",full:"Retail License",desc:"Full transferable license. Can be moved to different machines (within limits)."},
  {type:"Volume",full:"Volume License",desc:"Enterprise bulk licensing. One key for many machines. Cheaper per seat."},
  {type:"Subscription",full:"Subscription License",desc:"Recurring payment (monthly/yearly). Access stops when subscription lapses."},
  {type:"Open Source",full:"Open Source",desc:"Source code is publicly available. May be freely used, modified, redistributed (varies by license)."},
  {type:"Freeware",full:"Freeware",desc:"Free to use but source code not available. Cannot modify."},
  {type:"Shareware",full:"Shareware",desc:"Try before you buy. Limited features or time trial until paid.",legacy:true},
];

// ─── AAA FRAMEWORK (Authentication, Authorization, Accounting) ──────────────
const AAA_FRAMEWORK=[
  {step:"Authentication",color:"purple",desc:"Proving you are who or what you claim to be. Usually a username + password, but can include certificates, biometrics, or tokens.",detail:"This is always the FIRST step — you cannot authorize or account for someone whose identity hasn't been verified yet."},
  {step:"Authorization",color:"yellow",desc:"Checking what level of access or privilege you have once you've already been authenticated. Determines WHAT you're allowed to do, not who you are.",detail:"RADIUS and TACACS+ both authorize using attribute-value (AV) pairs that define exactly which rights/resources a verified user gets."},
  {step:"Accounting",color:"cyan",desc:"Keeping a track/log of everything — when you logged in, what you accessed, how long you were connected, and when you logged out.",detail:"Used for auditing, billing, troubleshooting, and security investigations after the fact. This is the 'paper trail' A of AAA."},
];
const AAA_COMPONENTS=[
  {name:"Supplicant",desc:"The device or client trying to gain access to the network — e.g., a laptop trying to join a secured Wi-Fi network."},
  {name:"Network Access Device",desc:"Also called the Authenticator. The switch, access point, or VPN concentrator the supplicant is connecting through. It doesn't make access decisions itself — it forwards credentials to the AAA server.",alsoKnownAs:"Authenticator"},
  {name:"AAA Server",desc:"The centralized server (commonly running RADIUS or TACACS+) that actually verifies credentials and decides whether to grant access. Often backed by a directory like Active Directory."},
];

// ─── REMOTE TERMINAL ACCESS (Telnet, SSH, RDP as one category) ─────────────
const REMOTE_ACCESS=[
  {name:"Telnet",port:23,secure:false,type:"Text-based (CLI)",desc:"Unsecure remote terminal emulation. Sends everything — including credentials — in plaintext. Legacy; SSH replaced it for this exact reason."},
  {name:"SSH",port:22,secure:true,type:"Text-based (CLI)",desc:"Secure remote terminal emulation. Encrypts the entire session including login credentials. The direct secure replacement for Telnet."},
  {name:"RDP",port:3389,secure:true,type:"Graphical (GUI)",desc:"Remote Desktop Protocol — full graphical host access and control, not just a command line. Windows' native remote access protocol."},
];

// ─── REMOTE ACCESS TECHNOLOGIES (Core 2 objective 4.9 — the FULL named list) ──
const REMOTE_ACCESS_TOOLS=[
  {name:"RDP",desc:"Covered above — Windows native remote graphical access.",secure:true},
  {name:"VPN",desc:"Creates an encrypted tunnel first, THEN other remote access happens inside it — the recommended layer to add before RDP/SSH over the open internet.",secure:true},
  {name:"VNC",full:"Virtual Network Computer",desc:"Cross-platform remote graphical access (works on Windows, Mac, Linux) — unlike RDP which is Windows-native. Security varies heavily by implementation/version.",secure:null},
  {name:"SSH",desc:"Covered above — secure encrypted command-line access.",secure:true},
  {name:"RMM",full:"Remote Monitoring and Management",desc:"Software used by IT teams (especially MSPs) to remotely monitor, patch, and manage many client machines at scale from one central console."},
  {name:"SPICE",full:"Simple Protocol for Independent Computing Environments",desc:"An open remote display protocol, most commonly used to access virtual machines (especially with KVM/QEMU hypervisors)."},
  {name:"WinRM",full:"Windows Remote Management",desc:"Microsoft's protocol for remote command execution and management, used heavily by PowerShell remoting (Enter-PSSession, Invoke-Command)."},
  {name:"Third-party tools",desc:"Screen-sharing software, videoconferencing software, file transfer software, and desktop management software — general categories of commercial remote access tools (TeamViewer, AnyDesk, etc.)."},
];

// ─── CLOUD-BASED PRODUCTIVITY TOOLS (Core 2 objective 1.11) ─────────────────
const CLOUD_PRODUCTIVITY=[
  {category:"Email systems",desc:"Cloud-hosted email like Microsoft 365 or Google Workspace — no local mail server to maintain."},
  {category:"Storage (sync/folder settings)",desc:"Cloud storage (OneDrive, Google Drive, Dropbox) that syncs a local folder automatically with the cloud copy."},
  {category:"Collaboration tools",desc:"Spreadsheets, videoconferencing, presentation tools, word processing, and instant messaging — all now commonly cloud-based rather than installed software."},
  {category:"Identity synchronization",desc:"Keeping a user's login identity consistent across cloud services (e.g., using the same Microsoft or Google account to sign into email, storage, and apps)."},
  {category:"Licensing assignment",desc:"Cloud services are usually licensed per-user rather than per-device — an admin assigns a license to a person's account, and it follows them across devices."},
];

// ─── BROWSER SECURITY (Core 2 objective 2.11 — entire objective, was missing) ─
const BROWSER_SECURITY=[
  {term:"Trusted vs untrusted sources (downloads)",desc:"Only install browser software/extensions from official, verified sources. Untrusted sources are a common malware delivery method."},
  {term:"Hashing (verifying downloads)",desc:"Comparing a downloaded file's cryptographic hash against the publisher's published hash confirms the file wasn't tampered with in transit."},
  {term:"Browser patching",desc:"Keeping the browser itself updated — browsers are a top attack target and patches close known exploits."},
  {term:"Extensions and plug-ins",desc:"Only install from trusted sources (official web stores); malicious extensions can read all browsing activity."},
  {term:"Password managers",desc:"Securely store and auto-fill unique, complex passwords per site — a major security upgrade over reusing passwords."},
  {term:"Secure connections / valid certificates",desc:"Look for HTTPS and a valid certificate before entering sensitive information — an invalid or expired certificate warning should not be ignored."},
  {term:"Pop-up blocker",desc:"Blocks unwanted pop-up windows, many of which are used for scams or malicious downloads."},
  {term:"Clearing browsing data / cache",desc:"Removes stored history, cookies, and cached files — useful for privacy and troubleshooting broken page loads."},
  {term:"Private-browsing mode",desc:"Doesn't save history/cookies locally after the session ends — does NOT make you anonymous online, just avoids local storage of your activity."},
  {term:"Sign-in/browser data synchronization",desc:"Syncs bookmarks, passwords, and settings across devices when signed into a browser account — convenient, but means a compromised account exposes synced data everywhere."},
  {term:"Ad blockers",desc:"Blocks advertisements, which also reduces exposure to malvertising (malicious ads that can deliver malware just from being displayed)."},
  {term:"Proxy settings",desc:"Routes browser traffic through an intermediary server — used for content filtering, caching, or anonymity."},
  {term:"Secure DNS",desc:"Encrypts DNS queries (via DNS over HTTPS or DNS over TLS) so an attacker on the network can't see or tamper with which sites you're resolving."},
];

// ─── INTERNET OF THINGS (IoT) ────────────────────────────────────────────────
const IOT_CONTROL=[
  {method:"Smart speaker",desc:"Voice-activated hub (e.g., a device that responds to spoken commands) that controls other IoT devices without needing a screen or app."},
  {method:"Smartphone app / web management",desc:"Most IoT devices are configured and controlled through a dedicated mobile app or a web-based dashboard, often requiring the device's own cloud account."},
];
const IOT_DEVICES=[
  {device:"Smart lights",desc:"Remotely controlled, scheduled, and often color/brightness adjustable lighting."},
  {device:"Smart curtains/blinds",desc:"Motorized window coverings controlled remotely or on an automated schedule."},
  {device:"Smart refrigerator",desc:"Internet-connected fridge — can track inventory, show cameras of contents, or send expiration alerts."},
  {device:"Smart TV",desc:"Television with built-in internet connectivity, apps, and often voice/smart-speaker integration."},
  {device:"Smart thermostat",desc:"Learns schedules and can be adjusted remotely — one of the most common real-world IoT devices."},
  {device:"Smart doorbell/camera",desc:"Internet-connected security device that streams video and sends motion alerts to a phone."},
];

// ─── TROUBLESHOOTING SCOPE (Limited Connectivity) ────────────────────────────
const CONNECTIVITY_SCOPE=[
  {q:"Is this a single host, or a switch/router problem?",desc:"If only ONE device has the issue, suspect that device's NIC, cable, or IP configuration. If MULTIPLE devices on the same segment are affected, suspect the switch, router, or upstream connection instead."},
  {q:"Can the host reach the local network but not the internet?",desc:"If local resources (printers, file shares, other PCs) work fine but internet sites don't, the LAN itself is healthy — the problem is upstream: default gateway, DNS, or the ISP connection."},
  {q:"Is the host connected to the correct switch/switch port?",desc:"A cable plugged into the wrong port — one assigned to a different VLAN or a disabled port — can look exactly like a dead network connection from the user's side."},
  {q:"Is the switch port configured with the correct VLAN?",desc:"Even with a perfect physical connection, a port assigned to the wrong VLAN puts the device on the wrong logical network, causing it to be unable to reach expected resources."},
];

// ─── CORE 1 HARDWARE TROUBLESHOOTING SYMPTOMS (Official Objectives 5.1-5.3, 5.5) ───
const MOBO_TROUBLESHOOTING=[
  {symptom:"POST beep codes",desc:"A pattern of beeps during startup, before anything shows on screen — the motherboard's way of signaling a hardware failure it detected before video even initializes. The exact pattern (check the motherboard manual) points to a specific failed component, often RAM or GPU."},
  {symptom:"Proprietary crash screens",desc:"Vendor-specific crash/error screens (distinct from Windows' BSOD) that some manufacturers show for hardware-level failures."},
  {symptom:"Capacitor swelling",desc:"Bulging or leaking capacitors on the motherboard — a visible sign of a failing motherboard, often caused by age or overheating. Replace the board; capacitors generally aren't safely user-serviceable."},
  {symptom:"Inaccurate system date/time",desc:"The clock resets or drifts — almost always a dead or dying CMOS battery."},
];
const STORAGE_TROUBLESHOOTING=[
  {symptom:"S.M.A.R.T. failure",desc:"Self-Monitoring, Analysis, and Reporting Technology — the drive's built-in health monitoring reports a predicted failure. Back up immediately and plan to replace the drive."},
  {symptom:"Low IOPS",full:"Input/Output Operations Per Second",desc:"A measurement of how many read/write operations a drive can handle per second. Unusually low IOPS on an SSD can indicate a failing drive or a controller bottleneck."},
  {symptom:"Extended read/write times",desc:"Operations that used to be fast are now noticeably slow — often an early warning sign of drive failure, especially paired with unusual noises on an HDD."},
  {symptom:"Grinding/clicking noises",desc:"On an HDD, grinding or repetitive clicking almost always means the read/write head or platter is physically failing — back up immediately."},
];
const DISPLAY_TROUBLESHOOTING=[
  {symptom:"Burnt-out bulb",desc:"On a projector specifically — the bulb has reached end of life and needs replacement; image is very dim or completely absent."},
  {symptom:"Dead pixels",desc:"Individual pixels that are permanently stuck (usually black, sometimes a fixed color) and never change regardless of what's displayed — a hardware defect in the panel itself, not fixable by software."},
  {symptom:"Screen burn-in",desc:"A ghost image permanently etched into the display from the same static content being shown too long — more common on OLED panels than LCD."},
  {symptom:"Flashing/flickering screen",desc:"Often a loose display cable, failing backlight/inverter, or an outdated/corrupted graphics driver."},
];
const NETWORK_TROUBLESHOOTING_EXTRA=[
  {symptom:"Port flapping",desc:"A switch port repeatedly going up and down (connecting/disconnecting) in rapid succession — often caused by a bad cable, failing NIC, or a duplex/speed mismatch."},
  {symptom:"Jitter",desc:"Inconsistent delay between packets arriving — causes choppy audio/video even when overall bandwidth and latency numbers look fine. A classic VoIP call quality problem."},
  {symptom:"Poor VoIP quality",desc:"Choppy or garbled voice calls — usually caused by jitter, packet loss, or insufficient bandwidth/QoS prioritization for voice traffic."},
];

// ─── GLOSSARY (110 terms, plain-English) ─────────────────────────────────────
const GLOSSARY={
  "IP":{full:"Internet Protocol",def:"The addressing system that gives every device on a network a unique number so data knows where to go."},
  "IP ADDRESS":{full:"Internet Protocol Address",def:"A device's current address on a network — like a mailing address that can change."},
  "MAC":{full:"Media Access Control",def:"A permanent hardware ID burned into every network card at the factory. Doesn't normally change."},
  "TCP":{full:"Transmission Control Protocol",def:"Reliable data delivery — double-checks everything arrived and puts it back in order. Slower but accurate."},
  "UDP":{full:"User Datagram Protocol",def:"Fast data delivery with no double-checking. Good for video calls and games."},
  "DNS":{full:"Domain Name System",def:"The internet's phonebook — turns a website name into the numeric IP address computers use."},
  "DHCP":{full:"Dynamic Host Configuration Protocol",def:"Automatically hands out IP addresses to devices joining a network."},
  "HTTP":{full:"HyperText Transfer Protocol",def:"The basic language web browsers and servers use to talk — not encrypted."},
  "HTTPS":{full:"HTTP Secure",def:"HTTP with TLS encryption added, so data can't be read if intercepted."},
  "TLS":{full:"Transport Layer Security",def:"The modern encryption technology behind HTTPS and most secure connections."},
  "SSL":{full:"Secure Sockets Layer",def:"The older predecessor to TLS. Mostly retired but the name is still used loosely."},
  "SSH":{full:"Secure Shell",def:"A secure, encrypted way to remotely control another computer's command line."},
  "FTP":{full:"File Transfer Protocol",def:"An older way to upload/download files to a server. Not encrypted by default."},
  "SFTP":{full:"Secure File Transfer Protocol",def:"File transfer through an encrypted SSH connection (port 22) — the secure replacement for FTP. CompTIA's official expansion is 'Secure File Transfer Protocol'; you may also see it called 'SSH File Transfer Protocol' elsewhere — same thing."},
  "SMTP":{full:"Simple Mail Transfer Protocol",def:"Sends email from one mail server to another."},
  "POP3":{full:"Post Office Protocol v3",def:"Downloads email to your device, then deletes it from the server."},
  "IMAP":{full:"Internet Message Access Protocol",def:"Keeps email on the server and syncs it across all your devices."},
  "LDAP":{full:"Lightweight Directory Access Protocol",def:"How systems look up info in a company directory, like Active Directory."},
  "SMB":{full:"Server Message Block",def:"How Windows computers share files and printers over a network."},
  "CIFS":{full:"Common Internet File System",def:"An older name/version of SMB, used interchangeably."},
  "SNMP":{full:"Simple Network Management Protocol",def:"How network equipment reports its status to a monitoring system."},
  "NTP":{full:"Network Time Protocol",def:"Keeps every device's clock in sync — important for authentication and logging."},
  "RDP":{full:"Remote Desktop Protocol",def:"Microsoft's protocol for remotely controlling a Windows desktop."},
  "VPN":{full:"Virtual Private Network",def:"Creates an encrypted tunnel over the public internet."},
  "NAT":{full:"Network Address Translation",def:"Lets many devices share one public IP address."},
  "WAN":{full:"Wide Area Network",def:"A network spanning a large area — an office to the internet, or between cities."},
  "LAN":{full:"Local Area Network",def:"A network confined to one place — a home or single office."},
  "PAN":{full:"Personal Area Network",def:"A very small network centered on one person's immediate devices — like a phone connected to a smartwatch and wireless earbuds via Bluetooth."},
  "MAN":{full:"Metropolitan Area Network",def:"A network spanning a city or large campus — bigger than a LAN, smaller than a WAN."},
  "SAN":{full:"Storage Area Network",def:"A dedicated high-speed network specifically for connecting servers to shared storage devices, separate from the regular data network."},
  "WLAN":{full:"Wireless LAN",def:"A LAN that uses Wi-Fi instead of physical cables."},
  "VLAN":{full:"Virtual LAN",def:"Splitting one physical network into separate virtual networks using software."},
  "ISP":{full:"Internet Service Provider",def:"The company that connects you to the internet."},
  "NIC":{full:"Network Interface Card",def:"The hardware that lets a device connect to a network. Has a unique MAC address."},
  "AP":{full:"Access Point",def:"A device that broadcasts Wi-Fi, bridging wireless clients to a wired network."},
  "SSID":{full:"Service Set Identifier",def:"The name of a Wi-Fi network."},
  "WPA":{full:"Wi-Fi Protected Access",def:"A family of Wi-Fi encryption standards. WPA2/WPA3 are current and secure."},
  "WEP":{full:"Wired Equivalent Privacy",def:"The original, very weak Wi-Fi encryption. Considered broken — never use it."},
  "SAE":{full:"Simultaneous Authentication of Equals",def:"The stronger login method WPA3 uses, resistant to password-guessing."},
  "RAID":{full:"Redundant Array of Independent Disks",def:"Combining multiple drives for speed, redundancy, or both."},
  "HDD":{full:"Hard Disk Drive",def:"Traditional storage with spinning magnetic platters. Slower, cheaper per GB."},
  "SSD":{full:"Solid State Drive",def:"Storage with no moving parts. Much faster and more durable than HDD."},
  "NVMe":{full:"Non-Volatile Memory Express",def:"A super-fast SSD interface that connects directly to the PCIe bus."},
  "SATA":{full:"Serial ATA",def:"The standard cable/connector for hard drives and many SSDs."},
  "RAM":{full:"Random Access Memory",def:"Short-term working memory — wiped when power turns off."},
  "CPU":{full:"Central Processing Unit",def:"The 'brain' of the computer that executes instructions."},
  "GPU":{full:"Graphics Processing Unit",def:"Specialized processor for rendering graphics and video."},
  "PSU":{full:"Power Supply Unit",def:"Converts wall AC power into the DC voltages internal parts need."},
  "BIOS":{full:"Basic Input/Output System",def:"The first software that runs on power-on, before the OS loads."},
  "UEFI":{full:"Unified Extensible Firmware Interface",def:"The modern replacement for BIOS. Supports Secure Boot, larger drives."},
  "TPM":{full:"Trusted Platform Module",def:"A security chip that securely stores encryption keys. Windows 11 requires it."},
  "PCIe":{full:"Peripheral Component Interconnect Express",def:"The high-speed motherboard slot for GPUs, fast storage, expansion cards."},
  "ATX":{full:"Advanced Technology eXtended",def:"The most common desktop motherboard/case size standard."},
  "OS":{full:"Operating System",def:"The core software that manages hardware and runs your programs."},
  "NTFS":{full:"New Technology File System",def:"Windows' default file system — permissions, encryption, large files."},
  "FAT32":{full:"32-bit File Allocation Table",def:"An older, simple file system still used on USB drives for compatibility."},
  "GUI":{full:"Graphical User Interface",def:"A visual way to interact with a computer using windows and a mouse."},
  "CLI":{full:"Command Line Interface",def:"A text-based way to control a computer by typing commands."},
  "UAC":{full:"User Account Control",def:"The 'Do you want to allow this app to make changes?' Windows prompt."},
  "GPO":{full:"Group Policy Object",def:"Rules an admin pushes to control settings on many Windows computers at once."},
  "AD":{full:"Active Directory",def:"Microsoft's system for managing users, computers, and permissions company-wide."},
  "MDM":{full:"Mobile Device Management",def:"Software that lets a company remotely manage/secure/wipe mobile devices."},
  "BYOD":{full:"Bring Your Own Device",def:"A policy allowing personal devices for work, usually with IT oversight."},
  "MFA":{full:"Multi-Factor Authentication",def:"Requiring two or more different proof types to log in."},
  "2FA":{full:"Two-Factor Authentication",def:"A common specific version of MFA using exactly two factors."},
  "TOTP":{full:"Time-based One-Time Password",def:"A 6-digit code that changes every 30 seconds, from an authenticator app."},
  "PII":{full:"Personally Identifiable Information",def:"Data that could identify a specific person — name, SSN, address."},
  "DDoS":{full:"Distributed Denial of Service",def:"Many computers flood a target with traffic at once to knock it offline."},
  "DoS":{full:"Denial of Service",def:"Overwhelming a system to make it unavailable to real users."},
  "IDS":{full:"Intrusion Detection System",def:"Watches traffic and ALERTS on suspicious activity — passive, doesn't block."},
  "IPS":{full:"Intrusion Prevention System",def:"Watches traffic and ACTIVELY BLOCKS threats — inline, not passive."},
  "EFS":{full:"Encrypting File System",def:"Windows feature that encrypts individual files/folders for the logged-in user."},
  "RTO":{full:"Recovery Time Objective",def:"Max acceptable TIME to restore systems after failure."},
  "RPO":{full:"Recovery Point Objective",def:"Max acceptable DATA LOSS, measured in time."},
  "SLA":{full:"Service Level Agreement",def:"A formal promise about service speed/reliability."},
  "EULA":{full:"End-user License Agreement",def:"The legal terms you agree to when installing software."},
  "OEM":{full:"Original Equipment Manufacturer",def:"A license tied to one specific piece of hardware."},
  "SaaS":{full:"Software as a Service",def:"Cloud software you just log into — provider manages everything else."},
  "PaaS":{full:"Platform as a Service",def:"Provider manages the OS; you manage your app and data."},
  "IaaS":{full:"Infrastructure as a Service",def:"You rent raw compute/storage/network and manage the OS yourself."},
  "VM":{full:"Virtual Machine",def:"A complete simulated computer running inside a real one."},
  "VDI":{full:"Virtual Desktop Infrastructure",def:"Centrally hosted desktops users connect to remotely."},
  "SDN":{full:"Software-Defined Networking",def:"Managing a network via centralized software instead of per-device config."},
  "ESD":{full:"Electrostatic Discharge",def:"Static electricity that's harmless to you but can destroy computer chips."},
  "SDS":{full:"Safety Data Sheet",def:"Document on safely handling/storing/disposing of a hazardous material."},
  "OSI":{full:"Open Systems Interconnection (model)",def:"A 7-layer model breaking down everything a network does."},
  "ARP":{full:"Address Resolution Protocol",def:"How a device finds the MAC address for a given IP on the local network."},
  "APIPA":{full:"Automatic Private Internet Protocol Addressing",def:"Fallback IP (169.254.x.x) a device gives itself when DHCP is unreachable."},
  "CIDR":{full:"Classless Inter-Domain Routing",def:"Modern notation for IP ranges, like /24."},
  "PoE":{full:"Power over Ethernet",def:"Sending power and data over the same cable — no separate power plug needed."},
  "WAP":{full:"Wireless Access Point",def:"Another name for an Access Point."},
  "NFC":{full:"Near Field Communication",def:"Extremely short-range wireless (inches) for tap-to-pay/tap-to-pair."},
  "eSIM":{full:"Embedded SIM",def:"A SIM built into the phone, set up digitally — no physical card."},
  "PBQ":{full:"Performance-Based Question",def:"A hands-on exam question — e.g. dragging steps into order — not multiple choice."},
  "BSOD":{full:"Blue Screen of Death",def:"The Windows crash screen for a fatal, unrecoverable error."},
  "POST":{full:"Power-On Self-Test",def:"The hardware check a computer runs the instant it's powered on."},
  "MBR":{full:"Master Boot Record",def:"Old-style info at the start of a drive telling the computer how to boot."},
  "BCD":{full:"Boot Configuration Data",def:"The modern Windows database of boot menu settings."},
  "DISM":{full:"Deployment Image Servicing and Management",def:"Windows tool to repair the system image when corrupted."},
  "SFC":{full:"System File Checker",def:"Windows tool that scans for and repairs damaged system files."},
  "WMIC":{full:"Windows Management Instrumentation Command-line",def:"Older CLI for Windows management. Being phased out for PowerShell."},
  "MSC":{full:"Microsoft Management Console (file)",def:"The .msc file extension for admin tools like services.msc."},
  "PID":{full:"Process ID",def:"The unique number Windows assigns each running program."},
  "ReFS":{full:"Resilient File System",def:"Newer, crash-resistant Windows Server file system."},
  "ext4":{full:"Fourth Extended Filesystem",def:"The standard file system on most Linux systems."},
  "APFS":{full:"Apple File System",def:"The default file system on modern Macs and iPhones."},
  "QoS":{full:"Quality of Service",def:"Network settings that prioritize certain traffic over other traffic."},
};

// ─── LESSONS (guided teaching path, separate from reference tabs) ───────────
const LESSONS=[
{id:"l1",title:"Welcome — How to Use This Guide",group:"Start Here",time:"3 min",
 hook:"You're not here to read a dictionary. You're here to build a mental model of how computers, networks, and operating systems actually work — so the exam questions stop feeling like trivia and start feeling like common sense.",
 sections:[
   {heading:"Two halves, one guide",body:"The tabs across the top (Ports, Hardware, Commands, Security, etc.) are your reference library — dense, fast to scan, built for lookup once you already know roughly what you're searching for. This Lessons tab is different. It's a taught path: each lesson builds up a concept from zero, the way a good instructor would in the first ten minutes of class, before pointing you at the full reference table."},
   {heading:"The teaching pattern in every lesson",body:"Each lesson follows the same shape: a hook to frame why this matters, a few teaching sections that build the idea piece by piece, a worked real-world scenario so you see it applied, a list of the mistakes people actually make on the exam, and a quick recap. At the end there's a 2-3 question self-check — don't skip it, that's where the material actually sticks."},
 ],
 scenario:{setup:"You open the Ports tab cold, with zero networking background.",walkthrough:"You see '22 — SSH — TCP' and have no idea what any of that means or why it matters. That's the wrong place to start.",resolution:"Read Lesson 3 (Networking, From Zero) first. It builds IP, MAC, DHCP, and DNS with plain analogies. Then Ports tab makes sense on sight, because you already know what a 'port' is a door into."},
 mistakes:[
   "Trying to memorize the reference tables before understanding why the categories exist.",
   "Skipping the self-check questions because they feel too easy — they're the fastest way to catch a gap.",
   "Reading a lesson once and assuming it's learned. Revisit lessons after a few days; that's when it actually sticks.",
 ],
 recap:["Lessons teach the WHY. Reference tabs give you the WHAT, fast.","Every lesson ends with a self-check — use it.","A 3-4 week study pace is realistic: 1-2 lessons a day plus daily flashcard review."],
 checkYourself:[
   {q:"What's the difference between a Lesson and a reference tab in this guide?",a:"Lessons teach the concept from scratch with plain-English explanations and examples. Reference tabs are dense, fast-lookup tables for when you already understand the concept and just need the specific fact."},
   {q:"What should you do if a self-check question feels too easy to bother with?",a:"Answer it anyway. Self-checks are the fastest way to catch a gap you didn't know you had — skipping them defeats their purpose."},
 ]},

{id:"l2",title:"What Is the CompTIA A+ Exam?",group:"Start Here",time:"4 min",
 hook:"Before you memorize a single port number, you need to understand the shape of the test you're actually taking — because that shapes how you should study.",
 sections:[
   {heading:"Two exams, one certification",body:"A+ isn't one test. It's Core 1 (220-1201) and Core 2 (220-1202), and you must pass both to earn the certification — passing only one gets you nothing on your resume. Core 1 leans hardware and networking: mobile devices, networking, hardware, virtualization/cloud, and troubleshooting. Core 2 leans software and process: operating systems, security, software troubleshooting, and operational procedures."},
   {heading:"What 'passing' actually means",body:"Each exam is scored out of 900, and you need 675 on Core 1 or 700 on Core 2. These are scaled scores, not raw percentages — CompTIA weights harder questions more, so you can't just count 'how many did I get right' and know your score. That's exactly why this guide's Exam Sim gives you a domain-by-domain breakdown instead of just a raw percentage."},
   {heading:"Not all questions are multiple choice",body:"Most questions describe a short real-world scenario and ask what you'd do next. A handful — usually at the very start of the exam — are PBQs (Performance-Based Questions), where you actually perform a task: drag steps into the right order, or match items to categories, instead of picking from a list."},
 ],
 scenario:{setup:"You've been studying hardware topics for two weeks and feel confident, but haven't touched security or operational procedures at all.",walkthrough:"You sit Core 1 and pass comfortably — hardware and networking were strong. Then you sit Core 2 cold and fail, because security and operational procedures make up over half that exam's weight and you never studied them.",resolution:"Check the Overview tab's domain weight breakdown before you start studying, not after. Core 2's Security (28%) and Operational Procedures (21%) domains need just as much attention as Core 1's Hardware (25%)."},
 mistakes:[
   "Assuming Core 1 knowledge automatically covers you on Core 2 — they test genuinely different domains.",
   "Studying only hardware/networking because it feels more 'technical' and skipping operational procedures, which is a real scored domain.",
   "Not realizing PBQs come first on the real exam — going in without practicing that format costs time you don't get back.",
 ],
 recap:["Pass BOTH Core 1 AND Core 2 — passing one alone earns nothing.","675/900 for Core 1, 700/900 for Core 2 — these are scaled scores, not raw percentages.","PBQs appear early and are worth practicing specifically — that's what the PBQ Sim tab is for."],
 checkYourself:[
   {q:"If you pass Core 1 but fail Core 2, do you earn the A+ certification?",a:"No. You must pass both exams to earn A+. Passing only one, no matter how well, does not count toward certification."},
   {q:"Why can't you just count 'number of questions right' to estimate your score?",a:"CompTIA uses scaled scoring out of 900, where harder questions are weighted more heavily than easier ones — so raw percentage correct doesn't map directly to your final score."},
 ]},

{id:"l2b",title:"Mobile Devices — The Domain People Skip",group:"Start Here",time:"5 min",
 hook:"Mobile Devices is worth 13% of Core 1 — smaller than Hardware or Troubleshooting, but still a guaranteed chunk of questions, and it's the domain people study least carefully because it feels 'obvious.' A few specific facts here are exactly the kind that trip people up.",
 sections:[
   {heading:"What actually gets replaced on a laptop or phone",body:"The exam tests a specific list of commonly-replaced mobile parts: battery, keyboard, RAM, storage (HDD/SSD), wireless cards, and the Wi-Fi antenna itself. That last one surprises people — antenna wires physically run from the wireless card, up through the display hinge, into antennas built into the screen bezel. This is exactly why replacing a laptop screen carelessly can kill your Wi-Fi: you can accidentally disconnect or damage the antenna wire during the repair."},
   {heading:"Connectivity is a whole category, not one fact",body:"USB-C, Lightning, NFC, and Bluetooth aren't just charging/pairing trivia — the exam wants you to know what each is actually FOR. USB-C is the modern universal standard for both charging and data. Lightning is Apple's older proprietary connector. NFC works at a few centimeters for tap-to-pay. Bluetooth works at roughly 10 meters for peripherals like headphones. Mixing these up (saying NFC has Bluetooth's range, for example) is a common wrong-answer trap."},
   {heading:"Network configuration means more than 'turn on Wi-Fi'",body:"This objective covers SIM/eSIM management, the exact Bluetooth pairing sequence (enable → make discoverable → find device → enter PIN → test), GPS vs. cellular-tower location services, and how MDM (Mobile Device Management) configures corporate-owned devices differently than personal BYOD devices. The Bluetooth pairing sequence specifically shows up as an ordering-style question."},
 ],
 scenario:{setup:"A user says their laptop's Wi-Fi signal became noticeably weaker right after a screen replacement, even though the wireless card itself wasn't touched.",walkthrough:"A junior technician assumes the wireless card must have failed and starts researching a replacement part.",resolution:"The far more likely cause: the thin Wi-Fi antenna wire running through the display hinge was pinched, disconnected, or damaged during the screen swap. Checking the antenna connector at the wireless card — and the routing through the hinge — should come before assuming the card itself is bad."},
 mistakes:[
   "Assuming a Wi-Fi problem after a screen repair must be the wireless card, instead of checking the antenna wire routed through the hinge first.",
   "Mixing up NFC's few-centimeter range with Bluetooth's ~10-meter range — they solve different problems and the exam tests the distinction directly.",
   "Not knowing the exact order of the Bluetooth pairing sequence when it's tested as an ordering question.",
 ],
 recap:["Mobile hardware replacement includes battery, keyboard, RAM, storage, wireless cards, and the Wi-Fi antenna — antenna wires route through the display hinge.","NFC = centimeters, tap-to-pay. Bluetooth = ~10 meters, peripherals.","Bluetooth pairing order: enable → discoverable → find device → enter PIN → test connectivity."],
 checkYourself:[
   {q:"A laptop's Wi-Fi weakens right after a screen replacement. What should you check before assuming the wireless card failed?",a:"The Wi-Fi antenna wire and its connector — antenna wires route from the wireless card, through the display hinge, into the screen bezel, and are easily pinched or disconnected during screen repairs."},
   {q:"What's the practical range difference between NFC and Bluetooth?",a:"NFC works at only a few centimeters (used for tap-to-pay). Bluetooth works at roughly 10 meters (used for headphones, keyboards, and other peripherals)."},
 ]},

{id:"l3",title:"Networking, From Zero",group:"Networking",time:"6 min",
 hook:"Almost every networking topic on this exam — ports, subnetting, DNS troubleshooting — is really just four ideas combined in different orders. Learn these four once, well, and the rest gets dramatically easier.",
 sections:[
   {heading:"IP address: your current mailing address",body:"Every device on a network needs an address so other devices know where to send data — that's an IP address, something like 192.168.1.42. Just like a mailing address, it can change: move to a new apartment, get a new address; join a new network, get a new IP."},
   {heading:"MAC address: your permanent fingerprint",body:"Separately, every piece of network hardware has a second ID burned in at the factory — its MAC address — and this one doesn't normally change no matter what network you join. IP address = where you live right now. MAC address = who you are, permanently."},
   {heading:"DHCP: the automatic address-assigner",body:"You almost never type in your own IP address by hand. A service called DHCP automatically hands one out the moment your device joins a network — exactly like a hotel front desk assigning you a room number the second you check in. No DHCP server reachable? Your device falls back to a self-assigned APIPA address (169.254.x.x) — which is itself a huge diagnostic clue you'll use constantly in troubleshooting."},
   {heading:"DNS: the internet's phonebook",body:"When you type a website name like google.com, your computer has no idea what that means on its own — it asks DNS to translate that name into the real numeric IP address. This single fact explains one of the most common real-world tickets: 'I can reach websites by IP but not by name' always points straight at DNS."},
 ],
 scenario:{setup:"A user calls IT: 'The internet is broken — I can't load any websites.'",walkthrough:"You have them open a command prompt and ping 8.8.8.8 — it works instantly. Then you have them try pinging google.com by name — it fails or times out.",resolution:"Because the IP-based ping worked but the name-based one didn't, the actual network connection is fine. The problem is specifically DNS — not the cable, not the router, not the ISP. You'd flush the DNS cache or check the DNS server setting next, not restart the modem."},
 mistakes:[
   "Confusing IP and MAC addresses — remember, IP changes, MAC (mostly) doesn't.",
   "Assuming 'no internet' always means a hardware problem, when the split between 'ping by IP works' vs 'ping by name fails' tells you immediately whether it's DNS.",
   "Not recognizing a 169.254.x.x address on sight as 'this device couldn't reach a DHCP server' — that number pattern is one of the most tested diagnostic signals on the whole exam.",
 ],
 recap:["IP address = current address, changeable. MAC address = permanent hardware fingerprint.","DHCP automatically assigns IP addresses; failure to reach DHCP produces a 169.254.x.x APIPA address.","DNS translates names to IP addresses — 'can ping IP but not name' is a DNS problem, not a connectivity problem."],
 checkYourself:[
   {q:"A device has IP address 169.254.12.4. What does that tell you immediately?",a:"The device could not reach a DHCP server and self-assigned an APIPA fallback address. Check the network cable/Wi-Fi and whether the DHCP server is running."},
   {q:"A user can ping 8.8.8.8 successfully but cannot load google.com. What's the likely cause?",a:"DNS. The network connection itself works fine (proven by the successful IP ping) — the failure is specifically in translating the domain name to an IP address."},
 ]},

{id:"l4",title:"Ports & Protocols, Explained",group:"Networking",time:"5 min",
 hook:"Once IP addresses click, ports are the natural next step — and they explain something you use every single day without thinking about it: how one computer runs a dozen different services at once.",
 sections:[
   {heading:"The building-and-door analogy",body:"If an IP address is a building's street address, a port number is the specific door inside that building. One computer can simultaneously run a website, an email server, and a remote-access tool — ports are how traffic stays sorted so each piece of data reaches the correct program instead of arriving at the wrong door."},
   {heading:"Two delivery styles: TCP and UDP",body:"Every port also uses one of two delivery styles. TCP is careful — it double-checks that everything arrived and puts it back in the right order, like sending certified mail with a signature required. UDP is fast — no double-checking at all, like shouting across a room. TCP is used where accuracy matters (web pages, email, file transfer). UDP is used where speed matters more than perfection (video calls, DNS queries, live gaming)."},
   {heading:"Where to start memorizing",body:"You don't need all 30 ports on day one. Anchor on the five marked Critical first: 22 (SSH, secure remote access), 80/443 (HTTP/HTTPS, web traffic), 25 (SMTP, sending email), 53 (DNS, name lookup), and 3389 (RDP, Windows remote desktop). Everything else sinks in naturally through repetition once these five are automatic."},
 ],
 scenario:{setup:"A company firewall admin needs to let employees browse the web securely, send email through the company's outbound mail server, and let IT remotely administer Windows servers.",walkthrough:"They need to open specific outbound ports for each of these three needs without opening everything.",resolution:"Port 443 for secure web browsing (HTTPS), port 587 for authenticated outbound email submission (not 25 — that's server-to-server), and port 3389 for RDP admin access. Opening broad ranges 'just in case' would be a security mistake — each service maps to a specific, intentional port."},
 mistakes:[
   "Confusing port 25 (server-to-server SMTP) with port 587 (client submission) — they look similar but serve different roles.",
   "Assuming TCP is always 'better' than UDP — they're suited to different jobs, not ranked by quality.",
   "Trying to memorize all 30 ports in one sitting instead of anchoring the five Critical ones first.",
 ],
 recap:["A port is the specific 'door' inside an IP address that routes traffic to the correct program.","TCP = reliable, double-checked delivery. UDP = fast, no-guarantee delivery.","Anchor on 22, 80/443, 25, 53, and 3389 first — the rest follow with repetition."],
 checkYourself:[
   {q:"Why does one computer need multiple ports instead of just one IP address?",a:"An IP address only identifies the device — a port identifies which specific program or service on that device should receive the traffic, since a computer can run many services at once."},
   {q:"When would you choose UDP over TCP?",a:"When speed matters more than guaranteed accuracy — video calls, live gaming, and DNS queries all use UDP because a little data loss is more acceptable than the delay TCP's double-checking would add."},
 ]},

{id:"l5",title:"Cables, Connectors & Network Devices",group:"Hardware",time:"6 min",
 hook:"Almost every cable and device question on this exam comes down to one core distinction repeated in different forms: copper versus fiber, and 'connects the same network' versus 'connects different networks.'",
 sections:[
   {heading:"Copper vs. fiber: electricity vs. light",body:"Every cable on this exam is either copper (sends data as electrical signal) or fiber (sends data as pulses of light). This single distinction explains nearly every difference tested — distance limits, interference resistance, and cost. The rule to lock in: all copper Ethernet maxes out at 100 meters no matter the category number (Cat5e, Cat6, Cat6a — all the same limit). Fiber can run for kilometers, because light doesn't degrade in a cable the way electrical signal does."},
   {heading:"Switches connect the same network",body:"A switch only knows about devices on its own local network and connects them to each other. It operates at Layer 2, using MAC addresses to figure out which port to send each frame to. Think of it as an internal mail room that only knows people within one building."},
   {heading:"Routers connect different networks",body:"A router is a level smarter — it connects entirely different networks together, like bridging your home network to the wider internet, and decides where traffic should go next. It operates at Layer 3, using IP addresses. Think of it as the postal service that routes mail between different buildings entirely."},
 ],
 scenario:{setup:"An office is being wired for a new server room 40 meters from the main switch, and the design also needs a 2km link to a second building across a parking lot.",walkthrough:"For the 40-meter in-building run, copper Ethernet is well within its 100-meter limit and is far cheaper to install. For the 2km inter-building link, copper is physically impossible — that distance requires fiber.",resolution:"Cat6a copper for the server room run (cheap, easy termination, well under 100m), single-mode fiber for the building-to-building link (only fiber can cover kilometers without signal loss)."},
 mistakes:[
   "Assuming a 'better' cable category (like Cat6 vs Cat6a) extends the 100m copper limit — it doesn't; the 100m ceiling applies to all copper Ethernet.",
   "Mixing up which device operates at which layer — Switch=Layer 2 (MAC), Router=Layer 3 (IP) is one of the most directly tested facts on Core 1.",
   "Forgetting that fiber's advantage isn't just distance — it's also complete immunity to electrical interference, which matters near heavy machinery or power lines.",
 ],
 recap:["Copper Ethernet: 100 meters max, regardless of category.","Fiber: kilometers of range, immune to electrical interference, more expensive and fragile.","Switch = Layer 2, same network, MAC addresses. Router = Layer 3, different networks, IP addresses."],
 checkYourself:[
   {q:"Would upgrading from Cat6 to Cat6a let you run a copper cable further than 100 meters?",a:"No. The 100-meter limit applies to all copper Ethernet cable regardless of category. Cat6a improves speed at longer copper distances (like maintaining 10 Gbps at the full 100m vs Cat6's 55m), but the 100m ceiling itself doesn't change."},
   {q:"What's the core functional difference between a switch and a router?",a:"A switch connects devices within the same local network using MAC addresses (Layer 2). A router connects different networks together and decides where traffic should go using IP addresses (Layer 3)."},
 ]},

{id:"l6",title:"Inside the Computer",group:"Hardware",time:"6 min",
 hook:"Two components get confused by nearly everyone learning this material for the first time — and once you separate them cleanly, half of Core 1's hardware section becomes intuitive.",
 sections:[
   {heading:"RAM vs. storage: the desk vs. the filing cabinet",body:"RAM is short-term working memory — completely wiped clean every time you power off, exactly like your physical desk while you're actively working on something. Storage (an SSD, or an older HDD) is long-term — it keeps your files even with the power off, like a filing cabinet. This single analogy resolves most RAM-vs-storage confusion on sight."},
   {heading:"The storage speed hierarchy",body:"Storage speed follows a clear pecking order worth memorizing directly: HDD (~120 MB/s, mechanical spinning platters) is slowest and cheapest. SATA SSD (~550 MB/s, no moving parts) is a major step up. NVMe SSD (3,000-7,000+ MB/s, connects directly to the fast PCIe bus instead of the older SATA interface) is fastest by a wide margin — often 10-50x an HDD."},
   {heading:"The other core components, briefly",body:"The CPU is the brain, executing every instruction the computer runs. The GPU renders graphics — either a discrete card or integrated into the CPU. The PSU converts wall AC power into the specific DC voltages every internal part actually needs to run. None of these work without the others; a bottleneck in any one drags down the whole system."},
 ],
 scenario:{setup:"A user complains their laptop is 'slow' — programs take a long time to open, and the fan runs constantly.",walkthrough:"You check Task Manager and see RAM usage pinned at 100% with a spinning HDD, even though only a browser and email client are open.",resolution:"The bottleneck is almost certainly insufficient RAM forcing the OS to swap data to the slow HDD constantly (thrashing) — recommending an SSD upgrade would help some, but adding RAM directly addresses the actual constraint here. This is a classic Core 1 hardware diagnosis: match the symptom (constant disk activity + high RAM usage) to the actual bottleneck, not just 'upgrade something.'"},
 mistakes:[
   "Saying 'more storage' when the actual fix needed is 'more RAM' — they solve completely different problems.",
   "Assuming all SSDs are equally fast — SATA SSD and NVMe SSD differ by roughly 5-10x in real-world throughput.",
   "Forgetting that RAM is volatile (erased on power-off) while storage is non-volatile — this distinction gets tested directly and often.",
 ],
 recap:["RAM = short-term, volatile, wiped on power-off. Storage = long-term, non-volatile, persists.","Speed order: HDD < SATA SSD < NVMe SSD, roughly a 10-50x range from slowest to fastest.","CPU executes instructions, GPU renders graphics, PSU supplies power — a bottleneck in any one limits the whole system."],
 checkYourself:[
   {q:"Why does RAM get wiped when you power off a computer, but storage doesn't?",a:"RAM is volatile memory — it requires continuous power to hold data and loses everything the instant power is cut. Storage (HDD/SSD) is non-volatile and retains data with no power at all."},
   {q:"Rank HDD, SATA SSD, and NVMe SSD from slowest to fastest, and explain why NVMe wins.",a:"HDD is slowest (mechanical spinning platters), SATA SSD is faster (flash memory, but limited by the SATA interface), NVMe SSD is fastest (flash memory connected directly to the high-speed PCIe bus, bypassing SATA's bottleneck entirely)."},
 ]},

{id:"l7",title:"RAID — Protecting Your Data",group:"Hardware",time:"5 min",
 hook:"RAID is one of the most misunderstood topics on this exam, because the name sounds like it always means 'backup' — and one specific level actively does the opposite.",
 sections:[
   {heading:"The core tradeoff RAID always makes",body:"RAID combines multiple physical drives into one logical unit, and every RAID level trades off speed, safety, and usable storage differently. There's no single 'best' level — only the right level for a given priority."},
   {heading:"RAID 0: the trap to know cold",body:"RAID 0 splits data across drives for maximum speed — and gives you zero protection in return. If even one drive in a RAID 0 array dies, every bit of data across the whole array is gone, permanently. It's a performance feature, not a safety feature, despite living under the 'RAID' name."},
   {heading:"RAID 1, 5, and 10: where the actual protection lives",body:"RAID 1 mirrors data across two drives — either can fail and you keep everything, but you only get half your total raw storage as usable space. RAID 5 needs at least 3 drives and survives exactly one drive failure using distributed parity data. RAID 10 combines mirroring and striping for both speed and safety together, at the cost of needing at least 4 drives and losing half your raw capacity, same as RAID 1."},
   {heading:"RAID is not a backup",body:"This is the single most important sentence in this lesson: RAID protects against a drive physically dying. It does nothing against ransomware encrypting your files, a user accidentally deleting a folder, or a fire destroying the whole server. You still need a real backup strategy — the 3-2-1 rule covered in the Backups lesson — on top of whatever RAID level you choose."},
 ],
 scenario:{setup:"A small business owner says 'we're on RAID 1, so we don't need backups anymore' after a technician installed a mirrored drive setup.",walkthrough:"Three months later, ransomware encrypts every file on the server. Because both mirrored drives in the RAID 1 array instantly reflect any change, the ransomware's encryption was faithfully copied to both drives — RAID 1 protected against a drive failure, but did nothing to stop file-level corruption or malicious encryption.",resolution:"The correct setup was RAID 1 for hardware fault tolerance PLUS a separate offsite/offline backup for actual data protection against corruption, deletion, or ransomware. RAID and backup solve two entirely different problems and neither substitutes for the other."},
 mistakes:[
   "Believing any RAID level 'is' a backup — none of them are; they all protect against hardware failure only, not data corruption or deletion.",
   "Choosing RAID 0 for a system holding data you actually care about, mistaking 'RAID' in the name for built-in safety.",
   "Forgetting RAID 5's minimum of 3 drives and RAID 10's minimum of 4 — these exact numbers are directly tested.",
 ],
 recap:["RAID 0 = speed only, zero fault tolerance. One drive failure loses everything.","RAID 1 (2 drives) and RAID 5 (3+ drives) both survive a single drive failure; RAID 10 (4+ drives) combines speed and safety.","RAID is never a substitute for a real backup — it protects against hardware failure only."],
 checkYourself:[
   {q:"Why is RAID 0 considered risky despite being a form of 'RAID'?",a:"RAID 0 stripes data across drives purely for speed and provides zero redundancy. If any single drive in the array fails, all data across the entire array is permanently lost."},
   {q:"A company relies solely on RAID 1 and gets hit by ransomware. Why doesn't RAID 1 save them?",a:"RAID 1 mirrors changes instantly across both drives — including malicious encryption from ransomware. It protects against a drive physically failing, not against data corruption, deletion, or encryption, which is why a separate backup strategy is still required."},
 ]},

{id:"l8",title:"Wireless Networking",group:"Networking",time:"5 min",
 hook:"Wi-Fi questions on this exam trip people up less because the material is hard, and more because every standard has two names running in parallel — miss that, and even simple questions feel like trick questions.",
 sections:[
   {heading:"Two naming systems for the same standard",body:"Every modern Wi-Fi standard has a technical name (802.11ac) and a friendlier marketing name (Wi-Fi 5) — and CompTIA expects you to recognize both referring to the exact same thing. 802.11ax is Wi-Fi 6 (or 6E with the added 6 GHz band). 802.11be is Wi-Fi 7. Losing points here is almost always a naming-recognition gap, not a knowledge gap."},
   {heading:"The security ladder: WEP to WPA3",body:"WEP and plain WPA are both broken — genuinely obsolete and insecure, never deployed on a new network. WPA2 is the current safe baseline most networks run today. WPA3 is newest and strongest, using a login method called SAE that resists password-guessing attacks even when the password itself isn't especially strong."},
   {heading:"Two specific exam traps worth memorizing directly",body:"802.11ac (Wi-Fi 5) is 5 GHz only — despite routers being marketed as 'dual-band,' that ac radio itself never touches 2.4 GHz. And WPS (the push-button pairing feature) should always be disabled: it has a documented PIN brute-force vulnerability that undermines whatever password strength you've set."},
 ],
 scenario:{setup:"A small office wants the fastest possible Wi-Fi and asks if their new 802.11ac router will work fine for their older 2.4 GHz-only smart thermostat.",walkthrough:"You explain that 802.11ac itself is 5 GHz only, so a device that can only do 2.4 GHz won't connect to the ac radio at all.",resolution:"Nearly all consumer 'ac' routers actually include a separate 2.4 GHz radio alongside the 5 GHz ac radio precisely to support older 2.4 GHz-only devices — so the thermostat connects fine, just not over the ac standard itself. This distinction (the standard vs. the physical router hardware) is exactly the kind of nuance the exam likes to test."},
 mistakes:[
   "Not recognizing 802.11ax as 'Wi-Fi 6' or 802.11ac as 'Wi-Fi 5' when a question uses one name and you only memorized the other.",
   "Leaving WPS enabled because it seems convenient, without recognizing the specific brute-force vulnerability it introduces.",
   "Assuming WPA2 is now considered weak — it's still the current safe baseline; WPA3 is an upgrade, not a requirement to avoid being 'insecure.'",
 ],
 recap:["Know both names for every standard: 802.11ac=Wi-Fi 5, 802.11ax=Wi-Fi 6/6E, 802.11be=Wi-Fi 7.","Security ladder: WEP and WPA are broken, WPA2 is the safe baseline, WPA3 is newest/strongest via SAE.","802.11ac is 5 GHz only. WPS should always be disabled."],
 checkYourself:[
   {q:"What is 802.11ax more commonly called in consumer marketing?",a:"Wi-Fi 6 (or Wi-Fi 6E for the version that adds the 6 GHz band)."},
   {q:"Why should WPS always be disabled on a router you administer?",a:"WPS has a documented vulnerability that allows an attacker to brute-force its PIN in a relatively short time, which can expose the network regardless of how strong the actual Wi-Fi password is."},
 ]},

{id:"l9",title:"Subnetting — Slowly, Step by Step",group:"Networking",time:"8 min",
 hook:"This is the topic most people dread walking into the exam — but it's genuinely just a counting puzzle once the pattern clicks, and this lesson exists to make sure it clicks before you touch the reference table.",
 sections:[
   {heading:"The apartment building analogy",body:"Imagine a big network is one huge apartment building, and every device needs its own unit number. Subnetting is the process of splitting that one big building into several smaller, separate buildings, each with its own private set of unit numbers — so traffic stays organized and contained instead of one massive shared space."},
   {heading:"The subnet mask's one job",body:"Every IP address comes paired with a subnet mask. The mask's entire job is to say: this many digits of the address identify the BUILDING, and the rest identify the UNIT inside it. Nothing more complicated than that underlies the whole topic."},
   {heading:"Reading the slash shorthand",body:"Instead of writing the full mask, people write a slash and a number — like /24. That number tells you how many of the 32 total bits in the address are reserved for the 'building' part. A bigger number after the slash means a SMALLER building with fewer available units — this inverse relationship is the single most common point of confusion, so sit with it until it feels natural."},
   {heading:"The three formulas that unlock everything else",body:"Host bits (digits left for unit numbers) = 32 minus the CIDR number. Total addresses in that subnet = 2 raised to the power of the host bits. Usable addresses = that total minus 2 — one address is always reserved to name the network itself, and one is reserved for broadcasting to everyone in it."},
 ],
 scenario:{setup:"You're given the address 192.168.1.130 with mask 255.255.255.192 (that's /26) and need to find the network address, the valid host range, and the broadcast address.",walkthrough:"Step 1: /26 means 26 bits for network, 6 bits left for hosts (32-26=6). Step 2: 2^6 = 64, so this subnet divides addresses into blocks of 64. Step 3: blocks start at 0, 64, 128, 192 — the address 130 falls in the block starting at 128.",resolution:"Network address (first in block) = 192.168.1.128. Broadcast (last in block) = 192.168.1.191. Valid host range = .129 through .190, giving 62 usable addresses (64 minus the 2 reserved). This exact walkthrough pattern — find the block size, find which block your address falls in, then read off network/broadcast/range — solves virtually every subnetting question on the exam."},
 mistakes:[
   "Thinking a bigger number after the slash means a bigger network — it's the opposite; /26 is smaller than /24.",
   "Forgetting to subtract 2 for usable addresses — the network address and broadcast address are never assignable to a device.",
   "Not memorizing the block-size shortcut: block size = 256 minus the last number in the subnet mask — this single trick makes almost every problem solvable in seconds.",
 ],
 recap:["Host bits = 32 − CIDR. Total addresses = 2^(host bits). Usable = total − 2.","A bigger CIDR number (like /28) means a SMALLER subnet, not a bigger one.","Quick shortcut: block size = 256 − last octet of the subnet mask — use this to instantly find which subnet an address belongs to."],
 checkYourself:[
   {q:"Does /28 describe a bigger or smaller subnet than /24?",a:"Smaller. A higher CIDR number reserves more bits for the network portion, leaving fewer host bits and therefore fewer usable addresses in that subnet."},
   {q:"For a /27 subnet, what is the block size and how many usable host addresses does it have?",a:"Block size = 256 − 224 (the last octet of 255.255.255.224) = 32. Host bits = 32−27 = 5, so total addresses = 2^5 = 32, and usable = 32−2 = 30."},
 ]},

{id:"l10",title:"Commands — What Problem Are You Solving?",group:"Software",time:"6 min",
 hook:"The Commands tab has 80+ entries, which feels overwhelming until you realize almost every one exists to answer just one of two questions — and once you sort by that lens, the list organizes itself.",
 sections:[
   {heading:"Question 1: What is my network doing right now?",body:"ipconfig shows your current IP settings. ping tests basic reachability to another host. tracert shows every router hop between you and a destination, with latency at each stop. nslookup tests DNS directly, letting you see exactly what a name resolves to. These four cover the overwhelming majority of 'is the network working' diagnosis."},
   {heading:"Question 2: How do I fix something that's broken?",body:"For corrupted Windows system files, there's a single most-tested sequence: run DISM /Online /Cleanup-Image /RestoreHealth FIRST to repair the underlying system image, THEN run sfc /scannow to repair the actual files using that now-healthy image. Running these backwards is a common exam trap — SFC depends on the image DISM repairs, so if you skip DISM first, SFC can fail or report false results."},
   {heading:"Why the OS tags matter",body:"Every command on the reference tab is tagged Windows, Linux, Both, or PowerShell — because syntax genuinely differs and the exam tests both Core 1 (general OS awareness) and Core 2 (deeper OS-specific troubleshooting). Getting comfortable recognizing 'this is a Windows-only command' vs 'this works the same on Linux' saves real time on scenario questions."},
 ],
 scenario:{setup:"A technician runs sfc /scannow on a Windows machine with corrupted system files, and it reports it 'could not fix all errors.'",walkthrough:"The technician is confused — SFC is supposed to fix corrupted files. What they missed is that SFC pulls known-good file copies from the local Windows image cache, and if that image itself is corrupted, SFC has nothing valid to restore from.",resolution:"Run DISM /Online /Cleanup-Image /RestoreHealth first — this repairs the underlying image (often by pulling fresh files from Windows Update). THEN re-run sfc /scannow, which can now successfully replace the corrupted files using the freshly repaired image."},
 mistakes:[
   "Running sfc /scannow before DISM when files are corrupted — the order matters and is tested directly.",
   "Confusing tracert (shows the path/hops) with ping (only tests basic reachability) — they answer different diagnostic questions.",
   "Assuming a command works identically on Windows and Linux without checking the OS tag — many share a concept but differ in exact syntax (ipconfig vs. ip addr, for example).",
 ],
 recap:["Most commands answer either 'what is my network doing' or 'how do I fix something broken.'","DISM always runs before SFC when repairing corrupted Windows system files.","Every command's OS tag (Win/Linux/Both/PS) matters — syntax genuinely differs across platforms."],
 checkYourself:[
   {q:"Why must DISM run before SFC when repairing Windows system files?",a:"SFC repairs files by pulling known-good replacements from the local Windows image cache. If that image itself is corrupted, SFC has nothing valid to restore from. DISM repairs the image first, giving SFC a healthy source to work from."},
   {q:"What's the difference between what ping and tracert each tell you?",a:"Ping only confirms whether a destination is reachable at all. Tracert shows the full path — every router hop along the way and the latency at each one — which helps identify exactly where in the path a problem is occurring."},
 ]},

{id:"l11",title:"Malware & Social Engineering",group:"Security",time:"6 min",
 hook:"Security questions on this exam almost always boil down to one classification question first: is this attacking the computer, or is this attacking the human sitting in front of it? Get that right and the rest follows.",
 sections:[
   {heading:"Two buckets: malware vs. social engineering",body:"Malware is malicious software running ON a device — viruses, worms, ransomware, rootkits. Social engineering is tricking a HUMAN into giving up access voluntarily — phishing emails, vishing phone calls, tailgating through a locked door. Recognizing which bucket a scenario falls into is very often the entire question, because the fix for each is completely different."},
   {heading:"The one sentence to memorize about ransomware",body:"If you ever see 'files encrypted' plus 'payment demand' in a question, the answer is always ransomware, and the correct response is always restore from clean backup — never pay the ransom. Paying funds further attacks and doesn't guarantee you get a working decryption key back."},
   {heading:"CompTIA's official 10-step malware removal process",body:"In exact order: (1) investigate and verify symptoms, (2) quarantine the infected system by disconnecting it from the network, (3) disable System Restore (in Windows Home) so the infection doesn't get preserved in a restore point, (4) remediate — actually remove the malware, (5) update anti-malware software, (6) scan and removal techniques such as Safe Mode or a preinstallation environment, (7) reimage/reinstall the OS if the infection is too severe to fully clean, (8) schedule regular scans and updates going forward, (9) re-enable System Restore and create a fresh restore point, and (10) educate the end user on how to avoid this happening again."},
 ],
 scenario:{setup:"An employee's computer starts encrypting files across a shared network drive, with a pop-up demanding bitcoin payment for a decryption key.",walkthrough:"A panicked IT tech's first instinct is to start deleting files or immediately try to pay the ransom to 'make it stop faster.'",resolution:"The correct first move is to physically disconnect the infected machine from the network immediately (quarantine) to stop the spread to other shared drives — before touching anything else. Then follow the 10-step process: disable System Restore, remediate, update anti-malware, scan, and ultimately restore the encrypted files from a clean backup. Never pay the ransom."},
 mistakes:[
   "Treating a phishing email as malware — it's social engineering; the fix is user training and email filtering, not antivirus alone.",
   "Skipping the quarantine step and going straight to removal — this risks the infection spreading further across the network while you work.",
   "Forgetting the exact order of the 10-step process — 'quarantine before remediate' and 'disable System Restore before remediate' are both directly testable sequencing facts.",
 ],
 recap:["Malware attacks the device. Social engineering tricks the human. Different problem, different fix.","Ransomware = encrypted files + payment demand. Response = restore from backup, never pay.","Official 10 steps, in order: investigate, quarantine, disable System Restore, remediate, update anti-malware, scan/removal, reimage if needed, schedule scans, re-enable System Restore, educate the end user."],
 checkYourself:[
   {q:"An employee receives a fake email pretending to be from the CEO, asking them to wire money urgently. Is this malware or social engineering?",a:"Social engineering (specifically phishing/business email compromise) — it's tricking a human into taking an action, not software attacking the device directly."},
   {q:"In the official 10-step malware removal process, what happens immediately after quarantining an infected system?",a:"Disable System Restore — this prevents the malware from being preserved in a restore point before you move on to actually removing it (remediation)."},
 ]},

{id:"l12",title:"VPNs & Encryption",group:"Security",time:"5 min",
 hook:"This lesson exists almost entirely to prevent one specific, extremely common exam trap — a VPN protocol that sounds secure but genuinely isn't, on its own.",
 sections:[
   {heading:"What a VPN actually does",body:"A VPN creates a private, encrypted tunnel for your data to travel through a public network like the internet — as if your traffic were physically running through a private cable instead of the open internet, even though it's really just encrypted and routed normally."},
   {heading:"The trap: not every VPN protocol encrypts on its own",body:"L2TP (Layer 2 Tunneling Protocol) by itself provides NO encryption whatsoever — it only creates the tunnel structure. It must be paired with IPsec (written as L2TP/IPsec) to actually be secure. If an exam question describes 'L2TP' alone as providing security, that's the wrong answer — this is one of the single most repeated traps across CompTIA's networking and security content."},
   {heading:"Split tunneling: a real-world tradeoff",body:"Split tunneling sends only traffic destined for the company network through the encrypted VPN tunnel, while regular internet browsing (YouTube, general web traffic) exits directly without going through the VPN. This saves bandwidth and improves speed for non-work traffic, but it does reduce overall security, since that non-tunneled traffic isn't protected by the VPN."},
 ],
 scenario:{setup:"A network administrator sets up a remote access VPN for employees using only L2TP, believing 'tunneling' means the traffic is automatically encrypted and safe.",walkthrough:"A security audit later flags the VPN as providing effectively no confidentiality protection, because raw L2TP traffic can be intercepted and read in plaintext.",resolution:"The fix is switching to L2TP/IPsec (adding IPsec specifically for the encryption layer L2TP lacks), or moving to a protocol with encryption built in from the start, like OpenVPN or WireGuard, which don't require pairing with a separate protocol to be secure."},
 mistakes:[
   "Assuming 'VPN' automatically means 'encrypted' — the specific protocol matters, and L2TP alone is the classic counterexample.",
   "Confusing 'tunneling' (creating a private path) with 'encryption' (making the contents unreadable) — L2TP does the first without the second.",
   "Not recognizing split tunneling as a legitimate real-world tradeoff choice rather than a mistake — it's a deliberate bandwidth-vs-security decision.",
 ],
 recap:["A VPN creates an encrypted tunnel over a public network.","L2TP alone has ZERO encryption — it must be paired with IPsec (L2TP/IPsec) to be secure.","Split tunneling routes only company traffic through the VPN, trading some security for bandwidth savings."],
 checkYourself:[
   {q:"Why is 'L2TP provides secure encryption' a false statement on its own?",a:"L2TP only creates the tunneling structure — it has no built-in encryption. It must be combined with IPsec (L2TP/IPsec) for the traffic to actually be encrypted and secure."},
   {q:"What's the security tradeoff of enabling split tunneling on a VPN?",a:"Only company-destined traffic is encrypted through the VPN tunnel; general internet browsing exits directly unprotected. This saves bandwidth and improves speed for non-work traffic but leaves that traffic without the VPN's security."},
 ]},

{id:"l13",title:"Windows Editions & File Systems",group:"Software",time:"6 min",
 hook:"A surprising number of real-world tickets ('why can't I join the domain?', 'why won't BitLocker enable?') trace back to one root cause: the user is on the wrong Windows edition for what they're trying to do — and no configuration change fixes that.",
 sections:[
   {heading:"Features that only exist starting at Pro",body:"Several heavily-tested features simply don't exist below Windows Pro edition, full stop: joining a company Active Directory domain, full BitLocker disk encryption, Group Policy Editor (gpedit.msc), and hosting incoming Remote Desktop connections. Windows Home genuinely cannot do any of these no matter how it's configured — there's no hidden setting to unlock them."},
   {heading:"Windows 11's specific hardware requirements",body:"Windows 11 requires a TPM 2.0 chip and Secure Boot-capable UEFI firmware, plus a 64-bit CPU, 4GB RAM, and 64GB storage as minimums. TPM 2.0 and Secure Boot are by far the most commonly tested requirements, because they're the ones that trip up older hardware trying to upgrade — RAM and storage minimums are rarely the actual blocker in practice."},
   {heading:"NTFS vs. FAT32: permissions vs. compatibility",body:"NTFS is the Windows standard, supporting file permissions and files larger than 4GB — it's what your main system drive uses. FAT32 is older and simpler, with no permissions support and a hard 4GB single-file size limit, but it remains in wide use on USB drives specifically because virtually every device (Windows, Mac, Linux, cameras, game consoles) can read it without extra drivers."},
 ],
 scenario:{setup:"A small business buys new laptops with Windows 11 Home preinstalled and wants IT to join them to the company's Active Directory domain and enable full-disk BitLocker encryption.",walkthrough:"IT tries the standard domain-join steps and finds the option simply isn't available in System Properties, and BitLocker only offers a limited 'device encryption' mode rather than full BitLocker controls.",resolution:"These aren't configuration problems — Home edition cannot join a domain or use full BitLocker under any settings combination. The business needs to upgrade the laptops to Windows Pro (a licensing upgrade, not a config change) before either feature becomes available."},
 mistakes:[
   "Trying to find a hidden setting to enable domain join or full BitLocker on Windows Home — these features are edition-gated, not settings-gated.",
   "Assuming any Windows 11 upgrade failure is due to insufficient RAM or storage, when TPM 2.0 and Secure Boot are the far more common real blockers.",
   "Choosing FAT32 for a large video file transfer without remembering its hard 4GB single-file size limit — this will fail partway through the copy.",
 ],
 recap:["Domain join, full BitLocker, gpedit.msc, and RDP hosting all require Windows Pro or higher — Home cannot do them at all.","Windows 11 requires TPM 2.0 and Secure Boot-capable UEFI — these are the most commonly missing requirements on older hardware.","NTFS = permissions + large files, the Windows standard. FAT32 = universal compatibility but capped at 4GB per file."],
 checkYourself:[
   {q:"A user on Windows 10 Home wants to join their company's Active Directory domain. What do you tell them?",a:"It's not possible on Home edition under any configuration — domain join is a Pro/Enterprise-only feature. They would need to upgrade to Windows Pro to gain that capability."},
   {q:"What are the two most commonly missing requirements when a Windows 11 upgrade fails on older hardware?",a:"TPM 2.0 (a security chip) and Secure Boot-capable UEFI firmware — these trip up far more upgrade attempts than the RAM or storage minimums do."},
 ]},

{id:"l14",title:"Backups, Safety & Professionalism",group:"Operations",time:"6 min",
 hook:"A meaningful chunk of this exam isn't about computers at all — it's about doing the job responsibly, safely, and professionally, and that domain gets underestimated by people who assume 'IT exam' means 'pure technical trivia.'",
 sections:[
   {heading:"Three backup types, three different tradeoffs",body:"A full backup copies everything, every single time — slow to create, but fastest to restore since only one backup set is needed. An incremental backup copies only what's changed since the LAST backup of any kind — fast to create, but slowest to restore because you need the full backup plus every single incremental since. A differential backup copies everything changed since the last FULL backup — a middle ground, growing larger each day until the next full backup resets it."},
   {heading:"The 3-2-1 rule",body:"Keep 3 copies of important data, on 2 different types of storage media, with 1 copy stored offsite. This single rule protects against three entirely different failure modes at once: hardware failure (multiple copies), a local disaster like fire or flood (the offsite copy), and even theft (varied media/locations make total loss less likely)."},
   {heading:"ESD: the invisible hardware killer",body:"Electrostatic Discharge is static electricity you often can't even feel, and it can silently and permanently damage electronic components on contact. Always wear a grounded anti-static wrist strap connected to the case before touching internal components — this single habit prevents a surprising share of real-world hardware failures caused by technicians, not by the hardware itself."},
 ],
 scenario:{setup:"A company's daily backup routine takes 6 hours to complete using full backups every night, and management wants that window shortened without losing the ability to restore quickly if needed.",walkthrough:"Switching to nightly incremental backups would shorten the backup window dramatically, but a full restore after a failure would now require the last full backup plus potentially weeks of incrementals applied in exact order — a slow and risky restore process.",resolution:"A differential backup strategy is the better middle ground here: full backup weekly, differential nightly. Restores need only the last full backup plus the single latest differential — much faster than chaining incrementals, while still keeping nightly backup windows short."},
 mistakes:[
   "Confusing incremental (since last backup of any kind) with differential (since last full backup) — the restore speed implications are opposite and directly tested.",
   "Treating the 3-2-1 rule as optional 'nice to have' rather than a specific, testable, named best practice.",
   "Skipping ESD precautions because 'it's just a quick RAM swap' — static damage is often invisible immediately and shows up as intermittent failures later.",
 ],
 recap:["Full = everything every time (slow backup, fast restore). Incremental = since last backup of any kind (fast backup, slow restore). Differential = since last full (middle ground).","3-2-1 rule: 3 copies, 2 media types, 1 offsite — protects against hardware failure, disaster, and theft simultaneously.","Always use a grounded anti-static wrist strap before touching internal components — ESD damage is often invisible until later."],
 checkYourself:[
   {q:"Why is restoring from incremental backups typically slower than restoring from differential backups?",a:"Incremental backups only capture changes since the last backup of ANY type, so a full restore requires the last full backup PLUS every incremental since, applied in exact order. Differential backups capture everything since the last FULL backup, so a restore only needs the full backup plus the single latest differential."},
   {q:"What three distinct risks does the 3-2-1 backup rule protect against simultaneously?",a:"Hardware failure (multiple copies exist), local disaster like fire or flood (the offsite copy survives), and theft or site-wide loss (varied media and locations reduce the chance of losing everything at once)."},
 ]},

{id:"l15",title:"Troubleshooting Common Problems",group:"Troubleshooting",time:"6 min",
 hook:"Most real IT problems repeat in a small number of recognizable patterns — and learning to pattern-match symptom to cause is worth more on this exam than memorizing an exhaustive list of every possible failure.",
 sections:[
   {heading:"CompTIA's official troubleshooting order",body:"Identify the problem, establish a theory of probable cause, test the theory, establish a plan of action and implement it, verify full functionality, and document everything. This exact sequence gets tested directly, including as an ordering-style PBQ — memorize it in order, not just as a list of steps."},
   {heading:"Three pattern-recognition shortcuts worth memorizing directly",body:"A device with IP 169.254.x.x means DHCP is unreachable (APIPA fallback) — check the cable and DHCP service, not the website or DNS. A user who can ping an IP address but not a website name has a DNS problem specifically — try ipconfig /flushdns as a first step. A Blue Screen of Death is usually a driver issue, failing RAM, or corrupted OS — the specific stop code shown is itself a diagnostic clue worth noting before doing anything else."},
   {heading:"Why the order matters more than the individual steps",body:"Jumping straight to 'implement a fix' without first establishing and testing a theory is the single most common real-world (and exam) mistake. A technician who reimages a machine before confirming the actual cause might solve the symptom while missing a hardware problem that will just recur."},
 ],
 scenario:{setup:"A user reports their computer 'won't connect to anything' this morning, and a junior technician immediately reinstalls the network driver without further diagnosis.",walkthrough:"The driver reinstall doesn't fix anything, because the actual root cause was a physically disconnected Ethernet cable — a problem the technician never actually confirmed before jumping to a technical fix.",resolution:"Following CompTIA's order correctly: identify the problem (no connectivity), establish a theory (could be cable, driver, DHCP, or ISP), test the theory (check the physical cable connection first — cheapest, fastest test), which reveals the actual cause immediately. Only then implement the fix (reconnect the cable) and verify functionality is restored."},
 mistakes:[
   "Skipping straight to a technical fix before testing a theory of what's actually wrong — this can waste time solving the wrong problem.",
   "Not recognizing 169.254.x.x on sight as a DHCP-reachability symptom specifically, rather than a general 'something's broken' signal.",
   "Failing to document the resolution — this step is easy to skip under time pressure but is directly part of the tested official process.",
 ],
 recap:["CompTIA order: identify, theorize, test, plan/implement, verify, document — in that exact sequence.","169.254.x.x = DHCP unreachable. Ping-IP-works-but-name-fails = DNS problem. BSOD = usually driver, RAM, or OS corruption.","Testing your theory before implementing a fix prevents solving the wrong problem."],
 checkYourself:[
   {q:"What comes immediately after 'establish a theory of probable cause' in CompTIA's troubleshooting methodology?",a:"Test the theory to determine the cause — you confirm your theory is correct before moving on to implementing any fix."},
   {q:"A user's computer shows a Blue Screen of Death. What's the first useful thing to do before attempting any fix?",a:"Note the specific stop code shown on the BSOD — it's a diagnostic clue pointing toward the likely cause (driver, RAM, or OS corruption) before you decide which fix to attempt."},
 ]},

{id:"l16",title:"Exam Day Strategy",group:"Start Here",time:"5 min",
 hook:"Knowing the material well is necessary but not sufficient — a handful of simple exam-day tactics can meaningfully change your score on a timed exam with performance-based questions mixed in.",
 sections:[
   {heading:"PBQs come first — plan your time accordingly",body:"Performance-based questions appear at the very start of the real exam and generally take longer than multiple choice. The strategy: if a PBQ looks complex, flag it and come back after building momentum on the multiple-choice questions, rather than burning a disproportionate share of your 90 minutes on the very first few questions."},
   {heading:"There's no penalty for guessing",body:"Every unanswered question counts as wrong, exactly the same as a wrong guess. This means you should never leave a question blank — even a pure guess has better odds than a guaranteed zero, and if you can eliminate even one obviously wrong option first, your odds improve further."},
   {heading:"Read the full scenario before answering",body:"Most questions describe a short real-world situation before asking what you'd do. The correct answer is very often hidden in a specific detail CompTIA included on purpose — skimming past that detail to jump straight to the options is a common way to miss an otherwise-known answer."},
   {heading:"Trust your first instinct, with one exception",body:"Changing a right answer to a wrong one out of second-guessing is a bigger real risk than most people expect going in. Only change your answer if you spot a concrete, specific reason your first choice was wrong — not just a vague feeling of doubt."},
 ],
 scenario:{setup:"You're 20 minutes into the exam and hit a complex PBQ asking you to drag several Windows repair commands into the correct order.",walkthrough:"You're unsure of the exact sequence and start spending several minutes second-guessing yourself, watching the clock tick down.",resolution:"The better move: flag the PBQ and move on to the multiple-choice questions first, where your pace will likely be faster and more confident. Come back to the flagged PBQ with whatever time remains — often, working through other questions first jogs your memory or reduces the pressure enough to think clearly about the sequencing."},
 mistakes:[
   "Spending too long on an early, hard PBQ and running short on time for the rest of the exam.",
   "Leaving a question blank because you're unsure — this guarantees zero credit when a guess would give you real odds.",
   "Changing a confident first answer due to vague doubt rather than a specific, concrete reason.",
 ],
 recap:["PBQs appear first and take longer — flag hard ones and return to them later rather than stalling early.","Never leave a question blank; there's no guessing penalty.","Read the full scenario carefully; the answer is often in a detail you'd miss by skimming straight to the options."],
 checkYourself:[
   {q:"Why is it strategically risky to spend a long time on the very first PBQ you encounter?",a:"PBQs appear at the start of the exam and tend to take longer than multiple choice. Getting stuck on an early one eats into the time budget for the rest of the exam, including questions you might answer more quickly and confidently."},
   {q:"Should you ever leave a question blank if you're completely unsure of the answer?",a:"No — an unanswered question counts as wrong exactly like an incorrect guess, so there's no benefit to leaving it blank. A guess, especially after eliminating any obviously wrong options, always has better odds than guaranteed zero credit."},
 ]},
];

// ─── COMPREHENSIVE FLASHCARDS (100+) ─────────────────────────────────────────
const FLASHCARDS=[
  // PORTS
  {id:1,cat:"Ports",q:"What port does HTTPS use and what protocol?",a:"Port 443, TCP. Encrypted with TLS/SSL. Look for the padlock in browsers.",hint:"It's 10x the HTTP port number."},
  {id:2,cat:"Ports",q:"What is the difference between POP3 and IMAP?",a:"POP3 (110): downloads email and DELETES it from server. Good for one device.\nIMAP (143): SYNCS email and KEEPS it on server. Good for multiple devices.",hint:"POP3 = Post Office (pick up and leave). IMAP = keeps on server."},
  {id:3,cat:"Ports",q:"What port does SSH use and what makes it secure?",a:"Port 22, TCP. SSH encrypts ALL traffic including the login. Used for SFTP too.",hint:"Same port as SFTP — they share port 22."},
  {id:4,cat:"Ports",q:"What port does RDP use?",a:"Port 3389, TCP/UDP. Windows Remote Desktop Protocol — full graphical remote access.",hint:"3389 — think '3 RDP 89'."},
  {id:5,cat:"Ports",q:"What ports does DHCP use and which is server vs client?",a:"Port 67: DHCP SERVER listens here.\nPort 68: DHCP CLIENT sends from here.\nBoth use UDP.",hint:"67 = Server, 68 = Client. Server comes first."},
  {id:6,cat:"Ports",q:"What port does DNS use and which protocols?",a:"Port 53. UDP for standard queries (fast). TCP for zone transfers and responses over 512 bytes.",hint:"DNS = 53. UDP for speed, TCP for big data."},
  {id:7,cat:"Ports",q:"What port does SMTP use and what is it for?",a:"Port 25 for server-to-server email. Port 587 for authenticated client submission (modern). Port 465 is legacy SMTPS.",hint:"25 = original SMTP. 587 = modern submission."},
  {id:8,cat:"Ports",q:"What port does FTP use and what's the difference between 20 and 21?",a:"Port 21: FTP Control — commands and authentication.\nPort 20: FTP Data — actual file transfer (active mode).\nPassive mode uses random ephemeral ports.",hint:"21 = Control (commands), 20 = Data (files)."},
  {id:9,cat:"Ports",q:"What port does Telnet use and why is it dangerous?",a:"Port 23, TCP. Telnet sends ALL data including passwords in PLAINTEXT. Anyone sniffing the network can see everything. Use SSH (22) instead.",hint:"Think: Telnet = Terrible for security."},
  {id:10,cat:"Ports",q:"What port does SMB/CIFS use?",a:"Port 445, TCP. Windows file sharing, printer sharing, Active Directory. Port 139 is the legacy NetBIOS version.",hint:"SMB = 445. Never expose 445 to the internet!"},
  {id:11,cat:"Ports",q:"What are IMAPS and POP3S ports?",a:"IMAPS = 993 (IMAP over SSL/TLS).\nPOP3S = 995 (POP3 over SSL/TLS). Both use TCP.",hint:"Secure versions add ~850 to the original port."},
  {id:12,cat:"Ports",q:"What port does LDAP use? What about LDAPS?",a:"LDAP = 389 (TCP/UDP) — Active Directory queries.\nLDAPS = 636 (TCP) — Secure LDAP over SSL/TLS.",hint:"LDAP=389, LDAPS=636."},
  {id:13,cat:"Ports",q:"What port does mDNS/Bonjour use?",a:"Port 5353, UDP. Multicast DNS for local network name resolution without a DNS server. Used by Apple Bonjour.",hint:"5353 — same digits as 53 DNS but multiplied."},
  {id:14,cat:"Ports",q:"What ports does SNMP use and what's the difference between 161 and 162?",a:"161 UDP: SNMP queries — manager polls/queries devices.\n162 UDP: SNMP Traps — devices send UNSOLICITED alerts TO manager.",hint:"161 = you ask it. 162 = it tells you."},
  // NETWORKING
  {id:15,cat:"Networking",q:"What is the loopback address and what range is reserved?",a:"127.0.0.1 is localhost. The ENTIRE 127.0.0.0/8 range is reserved for loopback. Pinging it tests the TCP/IP stack.",hint:"127.0.0.1 = home address for the computer itself."},
  {id:16,cat:"Networking",q:"What is APIPA and what range does it use?",a:"Automatic Private IP Addressing. Range: 169.254.0.0/16. Self-assigned when DHCP server is unreachable. Computers on APIPA can only communicate with others on same APIPA range.",hint:"169.254.x.x = 'I couldn't find a DHCP server.'"},
  {id:17,cat:"Networking",q:"What is the default route?",a:"0.0.0.0/0 — matches ANY destination. All traffic that doesn't match a specific route goes here (to the default gateway).",hint:"0.0.0.0/0 = 'I don't know where else to send this, so send it to the gateway.'"},
  {id:18,cat:"Networking",q:"What are the three private IP ranges?",a:"Class A: 10.0.0.0 – 10.255.255.255 (/8)\nClass B: 172.16.0.0 – 172.31.255.255 (/12)\nClass C: 192.168.0.0 – 192.168.255.255 (/16)",hint:"10, 172.16, 192.168 — memorize these three."},
  {id:19,cat:"Networking",q:"What does 'default gateway' mean?",a:"The IP address of the router on your local network. All traffic destined for OTHER networks is sent here first. Shown in ipconfig.",hint:"It's the door out of your local network."},
  {id:20,cat:"Networking",q:"What OSI layer does a Switch operate at?",a:"Layer 2 — Data Link. Uses MAC addresses stored in a CAM (Content Addressable Memory) table to forward frames.",hint:"Switch = 2. MAC = 2 letters? No — just remember 'Switch Layer 2'."},
  {id:21,cat:"Networking",q:"What OSI layer does a Router operate at?",a:"Layer 3 — Network. Routes packets between different networks using IP addresses and routing tables.",hint:"Router = 3. IP addresses live at Layer 3."},
  {id:22,cat:"Networking",q:"What is the OSI model from Layer 1 to 7?",a:"1=Physical, 2=Data Link, 3=Network, 4=Transport, 5=Session, 6=Presentation, 7=Application\nMnemonic: 'Please Do Not Throw Sausage Pizza Away'",hint:"PDNTSPA — bottom to top."},
  {id:23,cat:"Networking",q:"What layer do port numbers belong to?",a:"Layer 4 — Transport layer. TCP and UDP both use port numbers to identify which application should receive the data.",hint:"Ports are at Layer 4 Transport."},
  {id:24,cat:"Networking",q:"What is the difference between TCP and UDP?",a:"TCP: Connection-oriented, reliable, ordered, error-checked. 3-way handshake (SYN/SYN-ACK/ACK). Slower.\nUDP: Connectionless, no guarantee, faster. Good for streaming, DNS, gaming.",hint:"TCP = Certified Mail. UDP = Shouting into a crowd."},
  {id:25,cat:"Networking",q:"What are the copper Ethernet cable distance limits?",a:"ALL copper Ethernet (UTP/STP) has a maximum of 100 meters (328 feet) regardless of category (Cat5e, Cat6, Cat6a).",hint:"100 meters = copper Ethernet limit. Always."},
  {id:26,cat:"Networking",q:"What is Cat6 vs Cat6a at 10 Gbps?",a:"Cat6 at 10 Gbps: only 55 meters maximum.\nCat6a at 10 Gbps: full 100 meters maximum.\nBoth use RJ45.",hint:"Cat6 = 55m at 10G. Cat6a = 100m at 10G."},
  {id:27,cat:"Networking",q:"SMF vs MMF — what are the key differences?",a:"SMF (Single-Mode): ~9µm core, laser light, kilometers, ISP backbone, expensive.\nMMF (Multi-Mode): 50/62.5µm core, LED light, up to 550m, data centers, cheaper.",hint:"Single = small core = far distances. Multi = multiple paths of light = shorter."},
  {id:28,cat:"Networking",q:"What are PoE standards and their wattages?",a:"802.3af (PoE): 15.4W — basic APs, phones\n802.3at (PoE+): 30W — cameras, better APs\n802.3bt (PoE++): 60–90W — PTZ cameras, laptop charging",hint:"af < at < bt — alphabetical = more power."},
  {id:29,cat:"Networking",q:"What is the T568B pinout (all 8 pins)?",a:"1=White/Orange, 2=Orange, 3=White/Green, 4=Blue, 5=White/Blue, 6=Green, 7=White/Brown, 8=Brown",hint:"T568B is most common in US. Starts White/Orange."},
  {id:30,cat:"Networking",q:"What is the T568A pinout (pin 1)?",a:"T568A: Pin 1=White/Green (Green pair first).\nT568B: Pin 1=White/Orange (Orange pair first).\nDifference is only pins 1,2,3,6.",hint:"A=Green first, B=Orange first."},
  {id:31,cat:"Networking",q:"What is 802.11ac also called and what frequency?",a:"802.11ac = Wi-Fi 5. Uses 5 GHz ONLY. Up to 3.5 Gbps.",hint:"ac = 5 GHz only. 'ac' = almost certainly 5GHz."},
  {id:32,cat:"Networking",q:"What Wi-Fi standard added the 6 GHz band?",a:"802.11ax / Wi-Fi 6E added the 6 GHz band. Wi-Fi 7 (802.11be) also uses it with Multi-Link Operation.",hint:"6E = 6 GHz Extension."},
  {id:33,cat:"Networking",q:"What is 2.4 GHz vs 5 GHz Wi-Fi trade-off?",a:"2.4 GHz: longer range, more interference (neighbors/microwaves), channels 1/6/11 non-overlapping.\n5 GHz: shorter range, faster speeds, much less interference.",hint:"2.4=range, 5=speed. Always remember the trade-off."},
  // COMMANDS
  {id:34,cat:"Commands",q:"What does ipconfig /flushdns do and when do you use it?",a:"Clears the DNS resolver cache. Use when: user can ping IP addresses but can't reach websites by name — stale DNS cache entries.",hint:"Flush = empty the cache. DNS problem = flushdns."},
  {id:35,cat:"Commands",q:"What is the correct order: DISM first or SFC first?",a:"ALWAYS: DISM /Online /Cleanup-Image /RestoreHealth FIRST.\nTHEN: sfc /scannow.\nReason: SFC uses the Windows image store. If it's corrupted, SFC will fail or give wrong results.",hint:"DISM repairs the library. SFC uses the library."},
  {id:36,cat:"Commands",q:"What does chkdsk /r do vs /f?",a:"chkdsk /f: Fixes file system errors only.\nchkdsk /r: Locates bad sectors and recovers readable data (also performs /f).\n/r is the more thorough option.",hint:"/r does everything /f does, plus bad sector scan."},
  {id:37,cat:"Commands",q:"What does netstat -ano show?",a:"ALL active connections, ALL listening ports, and the PID (Process ID) of the program using each port. In numerical format (no DNS resolution).",hint:"a=all, n=numerical, o=owning PID."},
  {id:38,cat:"Commands",q:"What is the difference between rmdir and rmdir /s?",a:"rmdir (no flags): ONLY removes EMPTY directories. Returns error if not empty.\nrmdir /s: Removes the directory AND ALL its contents recursively.",hint:"/s = subdirectories and files too."},
  {id:39,cat:"Commands",q:"What does cipher /w:C actually do?",a:"WIPES free space on the C: drive by overwriting with zeros. Prevents deleted files from being forensically recovered. It does NOT encrypt anything.",hint:"cipher /w = wipe, NOT encrypt."},
  {id:40,cat:"Commands",q:"What does bootrec /fixmbr do vs /rebuildbcd?",a:"bootrec /fixmbr: Repairs the Master Boot Record (first sector of disk).\nbootrec /rebuildbcd: Rebuilds the Boot Configuration Data store (boot menu entries).",hint:"fixmbr = fix the start of disk. rebuildbcd = fix the boot menu."},
  {id:41,cat:"Commands",q:"What does gpupdate /force do?",a:"Forces an IMMEDIATE Group Policy update from the domain controller. Without /force, GP updates happen on a schedule (every 90 min with 30 min offset).",hint:"/force = don't wait, apply now."},
  {id:42,cat:"Commands",q:"What does arp -a display?",a:"The ARP cache — a table mapping IP addresses to MAC addresses for recently communicated devices on the local network.",hint:"ARP = Address Resolution Protocol. -a = all entries."},
  {id:43,cat:"Commands",q:"What does tracert show?",a:"The route packets take to reach a destination — shows each router hop, its IP address, and the round-trip latency for each hop. Useful for identifying where network congestion or failure occurs.",hint:"tracert = trace the route. Count the hops."},
  {id:44,cat:"Commands",q:"What is the Linux equivalent of ipconfig?",a:"ifconfig (legacy, deprecated) or ip addr show (modern). Also ip -4 addr for IPv4 only.",hint:"ip addr show = modern Linux. ifconfig = old."},
  // HARDWARE
  {id:45,cat:"Hardware",q:"What is the difference between HDD, SSD, and NVMe speed?",a:"HDD: ~100–150 MB/s (mechanical, slowest)\nSSD (SATA): ~500–600 MB/s (no moving parts)\nNVMe M.2: 3,000–7,000+ MB/s (PCIe bus, fastest)",hint:"HDD < SATA SSD < NVMe. NVMe is 10-50x faster than HDD."},
  {id:46,cat:"Hardware",q:"What does RAID 0 do and what is its fatal flaw?",a:"Striping — splits data across drives for maximum performance. FATAL FLAW: ONE drive fails = ALL data permanently lost. Zero fault tolerance.",hint:"RAID 0 = zero fault tolerance (the zero = zero safety)."},
  {id:47,cat:"Hardware",q:"How does RAID 1 work?",a:"Mirroring — writes exact copy to each drive simultaneously. Either drive can fail without data loss. 50% usable capacity. Two 1TB drives = 1TB usable.",hint:"RAID 1 = Mirror. Exactly 1 copy on each drive."},
  {id:48,cat:"Hardware",q:"What is RAID 5 minimum drives and fault tolerance?",a:"Minimum 3 drives. Tolerates ONE drive failure. Parity info distributed across all drives. N-1 drives usable for data.",hint:"RAID 5 = 5 fingers, 3 minimum. 1 can fail."},
  {id:49,cat:"Hardware",q:"What is RAID 10 and why is it the best?",a:"Stripe of mirrors (RAID 1+0). Minimum 4 drives. Can lose one drive per mirrored pair. Fast AND redundant. Best performance + safety combination.",hint:"RAID 10 = 1+0 = mirror then stripe. Best of both."},
  {id:50,cat:"Hardware",q:"What is a Type 1 vs Type 2 hypervisor?",a:"Type 1 (Bare-metal): Runs directly on hardware. No host OS. Most efficient. VMware ESXi, Hyper-V.\nType 2 (Hosted): Runs on host OS. Easier setup. VirtualBox, VMware Workstation.",hint:"Type 1 = directly on metal. Type 2 = on top of OS."},
  {id:51,cat:"Hardware",q:"What is the difference between a VM and a Container?",a:"VM: Full virtualized hardware, complete OS per VM, stronger isolation, heavier.\nContainer (Docker): Shares host OS kernel, lighter, faster to start, less isolation.",hint:"VM = whole apartment. Container = just a room."},
  {id:52,cat:"Hardware",q:"What form factor is the most common NVMe SSD?",a:"M.2 2280 (22mm wide, 80mm long). Uses PCIe interface. Key M or B+M slot. Plugs directly into motherboard.",hint:"M.2 = the little stick on the motherboard."},
  {id:53,cat:"Hardware",q:"What are the 80 PLUS PSU ratings in order?",a:"White (basic) → Bronze → Silver → Gold → Platinum → Titanium\nHigher rating = more efficient = less heat/electricity waste.",hint:"Bronze→Silver→Gold→Platinum→Titanium = alphabetical precious metals."},
  {id:54,cat:"Hardware",q:"What are ATX, Micro-ATX, and Mini-ITX?",a:"Form factors for motherboards and cases:\nATX: Full-size, most expansion slots\nMicro-ATX: Smaller, fewer slots\nMini-ITX: Smallest, 1 PCIe slot",hint:"ATX > Micro-ATX > Mini-ITX in size and expandability."},
  {id:55,cat:"Hardware",q:"What is ESD and how do you prevent it?",a:"Electrostatic Discharge — static electricity that can invisibly and permanently damage electronic components.\nPrevention: Anti-static wrist strap grounded to the case, anti-static mat, avoid carpeted floors.",hint:"ESD = invisible death to chips. Always ground yourself first."},
  // SECURITY
  {id:56,cat:"Security",q:"What are the official 10 steps for malware removal, in order?",a:"1.Investigate/verify symptoms 2.Quarantine 3.Disable System Restore (Win Home) 4.Remediate 5.Update anti-malware 6.Scan/removal (Safe Mode, PE) 7.Reimage/reinstall if needed 8.Schedule scans/updates 9.Enable System Restore + restore point 10.Educate the end user",hint:"IQ-D-R-U-S-R-S-E-E: Investigate, Quarantine, Disable, Remediate, Update, Scan, Reimage, Schedule, Enable, Educate."},
  {id:57,cat:"Security",q:"What is Zero Trust security?",a:"Never trust, always verify — even inside the network. Every user and device must authenticate and be authorized for EVERY resource access, regardless of location.",hint:"Zero trust = trust no one automatically. Verify every time."},
  {id:58,cat:"Security",q:"What does TPM 2.0 do and why does Windows 11 require it?",a:"Trusted Platform Module — security chip that stores encryption keys, certificates, and passwords securely. Required by Windows 11 for BitLocker, Secure Boot credential storage, and integrity measurements.",hint:"TPM = security chip. No TPM 2.0 = no Windows 11."},
  {id:59,cat:"Security",q:"What is the difference between BitLocker and EFS?",a:"BitLocker: Full DRIVE encryption. Requires TPM (or USB key). Encrypts everything including OS files.\nEFS (Encrypting File System): Individual file/folder encryption. Transparent to logged-in user. No TPM needed.",hint:"BitLocker = whole drive. EFS = individual files."},
  {id:60,cat:"Security",q:"What are MFA factors — something you KNOW, HAVE, ARE?",a:"KNOW: Password, PIN, security question\nHAVE: Hardware token (YubiKey), authenticator app (TOTP), smart card, phone\nARE: Fingerprint, face ID, retina, voice (biometrics)\nMFA requires 2+ different categories.",hint:"Know/Have/Are = the three factor categories."},
  {id:61,cat:"Security",q:"What is TOTP vs HOTP?",a:"TOTP (Time-based OTP): Changes every 30 seconds based on current time. Google Authenticator, Authy.\nHOTP (HMAC-based OTP): Counter-based, changes with each use.",hint:"T=Time-based (30s). H=HMAC/counter-based."},
  {id:62,cat:"Security",q:"What is L2TP's critical security limitation?",a:"L2TP provides tunneling ONLY — it has ZERO built-in encryption. It MUST be paired with IPsec (L2TP/IPsec) to be secure. L2TP alone sends data in plaintext inside the tunnel.",hint:"L2TP alone = no encryption. Always needs IPsec partner."},
  {id:63,cat:"Security",q:"WPA vs WPA2 vs WPA3 — what are the differences?",a:"WPA: TKIP encryption. Weak. Deprecated.\nWPA2: AES/CCMP encryption. Current standard. WPA2-Personal (PSK) vs WPA2-Enterprise (RADIUS).\nWPA3: SAE (Simultaneous Authentication of Equals). Strongest. Resistant to offline dictionary attacks.",hint:"WPA=TKIP(bad), WPA2=AES(good), WPA3=SAE(best)."},
  {id:64,cat:"Security",q:"What is WPA2 Personal vs WPA2 Enterprise?",a:"WPA2 Personal (PSK): One shared password for all users. Home/small office.\nWPA2 Enterprise (802.1X): Each user authenticates individually via RADIUS server. Large organizations.",hint:"Personal=shared password. Enterprise=individual RADIUS auth."},
  {id:64.5,cat:"Security",q:"What is the key difference between RADIUS and TACACS+?",a:"RADIUS (Remote Authentication Dial-in User Server): combines authentication and authorization together, encrypts only the password portion of packets, uses UDP. TACACS+ (Terminal Access Controller Access-control System): fully separates authentication, authorization, and accounting (true AAA), encrypts the entire packet, uses TCP. Cisco environments favor TACACS+ for device administration.",hint:"RADIUS=UDP, password-only encryption. TACACS+=TCP, full packet encryption, true AAA."},
  {id:65,cat:"Security",q:"What is a rootkit and why is it hard to remove?",a:"Malware that hides itself AND other malware from the operating system. Runs at kernel level. Standard antivirus running in Windows can't see it.\nFix: Bootable offline antivirus scanner.",hint:"Root = runs at kernel. Can't detect from within the infected OS."},
  {id:66,cat:"Security",q:"What is ransomware and the correct response?",a:"Ransomware encrypts files and demands payment. CORRECT RESPONSE: Isolate the system, identify the variant, restore from clean backups. NEVER pay the ransom — it funds criminals and doesn't guarantee decryption.",hint:"Ransomware = encrypt + demand. Response = backup restore."},
  {id:67,cat:"Security",q:"What is the difference between IDS and IPS?",a:"IDS (Intrusion Detection System): Monitors and ALERTS on suspicious activity. Passive — does not block.\nIPS (Intrusion Prevention System): Monitors and ACTIVELY BLOCKS threats. Inline device.",hint:"IDS = Detective (alerts). IPS = Police (blocks)."},
  {id:68,cat:"Security",q:"What is Secure Boot and why is it important?",a:"UEFI feature that only allows cryptographically signed bootloaders and OS kernels to run. Prevents boot-level rootkits and malware from loading before the OS.",hint:"Secure Boot = only signed code can boot."},
  // OS / WINDOWS
  {id:69,cat:"OS/Windows",q:"What features does Windows Pro have that Home does not?",a:"BitLocker encryption, Domain join, Group Policy Editor (gpedit.msc), Remote Desktop HOST, Hyper-V, Windows Sandbox, Assigned Access.",hint:"Pro adds: BitLocker, Domain, Group Policy, RDP host."},
  {id:70,cat:"OS/Windows",q:"What file system does Windows use by default and what does NTFS support?",a:"NTFS by default. NTFS supports: File permissions (ACLs), EFS encryption, Journaling, Files >4GB, Compression, Disk quotas, Hard/soft links.",hint:"NTFS = New Technology File System. FAT32 = 4GB limit."},
  {id:71,cat:"OS/Windows",q:"What is the difference between NTFS and FAT32?",a:"NTFS: Max file size unlimited (volume-limited), permissions, encryption, journaling. Modern.\nFAT32: Max file 4GB, no permissions, cross-platform compatible, used for USB drives.",hint:"FAT32 = 4GB max file = its biggest limitation."},
  {id:72,cat:"OS/Windows",q:"What is ReFS and when would you use it?",a:"Resilient File System. Windows Server feature. Better data integrity than NTFS, built-in checksums, automatic corruption detection. Used on data volumes. Cannot be used as boot volume.",hint:"ReFS = Resilient. Server storage. Not bootable."},
  {id:73,cat:"OS/Windows",q:"What is User Account Control (UAC)?",a:"Windows security feature that prompts for administrator approval before allowing elevation of privileges. Protects against unauthorized system changes. NEVER disable UAC.",hint:"UAC = the 'Do you want to allow...' prompt."},
  {id:74,cat:"OS/Windows",q:"What are the Windows Registry hives?",a:"HKLM (Local Machine) — system-wide settings\nHKCU (Current User) — current user settings\nHKCR (Classes Root) — file associations\nHKU (Users) — all user profiles\nHKCC (Current Config) — hardware profile",hint:"HKLM, HKCU, HKCR, HKU, HKCC — 5 hives."},
  {id:75,cat:"OS/Windows",q:"What is the laser printer process in order?",a:"1.Raster 2.Charge 3.Expose 4.Develop 5.Transfer 6.Fuse 7.Clean\nMnemonic: 'Really Cheap Electronics Don't Turn Fancy Clean'",hint:"7 steps: RCEDT FC — Raster Charge Expose Develop Transfer Fuse Clean."},
  {id:76,cat:"OS/Windows",q:"What is an incremental vs differential backup?",a:"Incremental: Backs up changes since LAST BACKUP OF ANY TYPE. Fastest to back up, slowest to restore (need full + all incrementals).\nDifferential: Backs up changes since last FULL backup. Slower backup, faster restore (only need full + latest differential).",hint:"Incremental = since last backup (any). Differential = since last FULL."},
  {id:77,cat:"OS/Windows",q:"What is the 3-2-1 backup rule?",a:"3 copies of data, on 2 different media types, with 1 copy stored OFFSITE.\nProtects against hardware failure, local disaster (fire/flood), and theft.",hint:"3 copies, 2 media, 1 offsite."},
  {id:78,cat:"OS/Windows",q:"What is RTO vs RPO in disaster recovery?",a:"RTO (Recovery Time Objective): Maximum acceptable TIME to restore systems after failure.\nRPO (Recovery Point Objective): Maximum acceptable DATA LOSS measured in time (how old can the backup be).",hint:"RTO = time to recover. RPO = data loss tolerance."},
  // MOBILE/NEW TOPICS
  {id:79,cat:"Mobile",q:"What is MDM and why is it important for BYOD?",a:"Mobile Device Management — software that centrally manages/controls mobile devices. For BYOD (Bring Your Own Device), MDM enforces policies, enables remote wipe, enforces encryption, and manages app deployment.",hint:"MDM = control panel for all mobile devices in an org."},
  {id:80,cat:"Mobile",q:"What is eSIM?",a:"Embedded SIM — SIM functionality built into the device, no physical card required. Can be programmed and carrier-switched remotely. Standard in modern smartphones.",hint:"eSIM = no physical card, programmed via software."},
  {id:81,cat:"Mobile",q:"Bluetooth vs NFC — range and use cases?",a:"Bluetooth: ~10 meters. Wireless audio, peripherals, file transfer, beacons.\nNFC: ~4 centimeters. Contactless payments (Apple Pay, Google Pay), tap-to-pair, access cards.",hint:"Bluetooth=10m (ears). NFC=4cm (tap to pay)."},
  {id:82,cat:"Mobile",q:"What is hotspot vs tethering?",a:"Hotspot: Phone broadcasts a Wi-Fi network that other devices join wirelessly.\nTethering: Share phone's internet via USB cable, Bluetooth, or Wi-Fi. Both use the phone's cellular data.",hint:"Hotspot=broadcasts Wi-Fi. Tethering=share via cable/BT."},
  {id:83,cat:"Mobile",q:"What does WPA3 use instead of WPA2's PSK?",a:"WPA3 uses SAE (Simultaneous Authentication of Equals), also called Dragonfly. Resistant to offline dictionary attacks even with weak passwords.",hint:"WPA3 = SAE = Dragonfly. Stronger key exchange."},
  {id:84,cat:"Mobile",q:"What is split tunneling in a VPN?",a:"Configuration where only traffic destined for the corporate network goes through the VPN tunnel. Other internet traffic (YouTube, etc.) bypasses the VPN for direct access. Saves bandwidth.",hint:"Split tunneling = some traffic in tunnel, some goes direct."},
  // NEW 2025 TOPICS
  {id:85,cat:"New 2025",q:"What are the official CompTIA A+ AI objective's four sub-areas (Core 2, Objective 4.10)?",a:"1. Application integration (how AI plugs into existing tools)\n2. Policy (appropriate use, plagiarism)\n3. Limitations (bias, hallucinations, accuracy)\n4. Private vs. public AI (data security, data source, data privacy)",hint:"App integration, Policy, Limitations, Private vs public — the exact 4.10 structure."},
  {id:86,cat:"New 2025",q:"What is Zero Trust and its core principle?",a:"Security model: Never trust, always verify. No implicit trust based on network location. Every access request must be authenticated and authorized, every time, regardless of whether inside or outside network perimeter.",hint:"Zero Trust = verify everyone, every time, everywhere."},
  {id:87,cat:"New 2025",q:"What is WireGuard and how does it compare to OpenVPN?",a:"Modern VPN protocol with a tiny codebase (~4,000 lines vs OpenVPN's 70,000+). Faster, uses modern cryptography (ChaCha20, Curve25519), easier to audit. Built into Linux kernel 5.6+.",hint:"WireGuard = small, fast, modern. Built into Linux kernel."},
  {id:88,cat:"New 2025",q:"What are the Windows 11 minimum requirements?",a:"TPM 2.0 chip required\nSecure Boot capable UEFI\n64-bit processor, 1GHz+, 2+ cores\n4GB RAM minimum\n64GB storage minimum\nDirectX 12 graphics",hint:"Win11: TPM 2.0 + Secure Boot + UEFI = mandatory."},
  {id:89,cat:"New 2025",q:"What is SDN (Software-Defined Networking)?",a:"Network managed via software controller rather than configuring individual hardware devices. Separates the control plane from the data plane. Enables centralized network management and automation.",hint:"SDN = manage network with software, not CLI on each switch."},
  {id:90,cat:"New 2025",q:"What is the difference between a container and a VM in terms of OS?",a:"VM: Each VM has its own complete OS kernel. Heavier, more isolated.\nContainer: Shares the HOST OS kernel. Much lighter, faster to start, less overhead. If host kernel fails, all containers fail.",hint:"Container shares kernel. VM has its own."},
  // OPERATIONAL PROCEDURES
  {id:91,cat:"Ops",q:"What is a change management process?",a:"Formal process: 1.Request change 2.Assess impact/risk 3.Get approval 4.Test in non-production 5.Schedule downtime/notification 6.Implement 7.Verify 8.Rollback plan if failed 9.Document",hint:"Change management = plan, approve, test, implement, document."},
  {id:92,cat:"Ops",q:"What is EULA and why does it matter?",a:"End User License Agreement — legal contract between software vendor and user. Defines permitted use, restrictions, and limitations. Accepting EULA is required to use most software.",hint:"EULA = the license you click 'I agree' to."},
  {id:93,cat:"Ops",q:"What is the difference between OEM and Retail software licensing?",a:"OEM: Tied to specific hardware. Cannot be transferred. Cheaper. Usually comes with new PC.\nRetail: Transferable between machines (within limits). Can move to new hardware.",hint:"OEM=tied to hardware. Retail=transferable."},
  {id:94,cat:"Ops",q:"What is proper disposal of lithium batteries?",a:"Never throw in regular trash — fire hazard and toxic chemicals. Use designated battery recycling programs (Best Buy, Staples, municipal recycling). Do not puncture or incinerate.",hint:"Battery disposal = specialized recycling. Never trash."},
  {id:95,cat:"Ops",q:"What is an MSDS/SDS and when is it needed?",a:"Material Safety Data Sheet / Safety Data Sheet. Required for all hazardous materials (toner, cleaning agents, thermal paste). Contains safe handling, storage, disposal, and first aid information.",hint:"SDS = how to handle chemicals safely."},
  // TROUBLESHOOTING SCENARIOS
  {id:96,cat:"Troubleshoot",q:"User gets 169.254.x.x IP. What happened and what do you do?",a:"APIPA address — DHCP server is unreachable or DHCP service failed. Steps: 1.Check cable/Wi-Fi connection 2.ipconfig /release then ipconfig /renew 3.Verify DHCP server is running 4.Check for DHCP scope exhaustion",hint:"169.254.x.x = DHCP failed. Fix DHCP or connectivity."},
  {id:97,cat:"Troubleshoot",q:"User can ping 8.8.8.8 but websites won't load by name. What's wrong?",a:"DNS failure — network works fine but DNS can't resolve names. Fix: 1.ipconfig /flushdns 2.Try nslookup google.com 3.Check DNS server settings in ipconfig /all 4.Try setting DNS to 8.8.8.8 manually",hint:"Ping IP works = network fine. Name fails = DNS problem."},
  {id:98,cat:"Troubleshoot",q:"Windows won't boot — MBR corrupted. What commands do you run?",a:"Boot from Windows installation media → Recovery → Command Prompt:\n1. bootrec /fixmbr\n2. bootrec /fixboot\n3. bootrec /scanos\n4. bootrec /rebuildbcd\nThen restart.",hint:"Boot from install media → Recovery → bootrec commands in order."},
  {id:99,cat:"Troubleshoot",q:"PC is blue screening (BSOD). What are the troubleshooting steps?",a:"1.Note/photograph the stop error code\n2.Check Event Viewer for details\n3.Boot to Safe Mode if needed\n4.Run sfc /scannow (after DISM)\n5.Test RAM with MemTest86\n6.Check for recent driver/Windows updates\n7.Roll back recent changes",hint:"BSOD = stop code first, then Event Viewer, then RAM test."},
  {id:100,cat:"Troubleshoot",q:"Printer prints blank pages. What do you check?",a:"1.Check ink/toner levels\n2.Check for protective tape still on cartridge\n3.Run a nozzle check/test page\n4.Clean print heads (inkjet)\n5.Check drum unit (laser)\n6.Verify correct paper type/size loaded",hint:"Blank pages = no ink getting to paper. Check levels, heads, drum."},
  {id:101,cat:"Troubleshoot",q:"Computer runs hot and randomly shuts down. What do you do?",a:"Thermal shutdown — overheating protection. Steps:\n1.Check all fans are spinning\n2.Blow dust from heatsink/fans with compressed air\n3.Check thermal paste on CPU — may need replacement\n4.Verify case airflow\n5.Check BIOS temps\n6.Monitor with HWMonitor or similar",hint:"Random shutdown = thermal. Dust, fans, thermal paste."},
  {id:102,cat:"Troubleshoot",q:"User can't connect to a network share. What do you check?",a:"1.Verify network connectivity (ping server)\n2.Check share permissions vs NTFS permissions\n3.Verify Windows Firewall not blocking\n4.Check SMB (port 445) is accessible\n5.Verify user has permission to the share\n6.Check 'net use' for mapped drives",hint:"Network share = check network, then permissions, then firewall."},
  {id:103,cat:"Troubleshoot",q:"After Windows update, device shows yellow ! in Device Manager. What now?",a:"Yellow exclamation = driver issue or resource conflict. Steps:\n1.Right-click → Update Driver\n2.Roll back driver if update caused it\n3.Uninstall device, restart (Windows reinstalls)\n4.Download manufacturer's driver manually\n5.Check for hardware resource conflicts",hint:"Yellow ! = driver or conflict. Update, rollback, or reinstall driver."},
  // ADDITIONAL — DEEPER NETWORKING DRILLS
  {id:104,cat:"Networking",q:"A /27 subnet has how many usable host addresses?",a:"Host bits = 32-27 = 5. Total = 2^5 = 32. Usable = 32-2 = 30.",hint:"5 host bits, 2^5=32, minus 2."},
  {id:105,cat:"Networking",q:"What is the block size shortcut for finding subnets quickly?",a:"Block size = 256 minus the last octet of the subnet mask. E.g. mask .192 → block size 64.",hint:"256 − last mask octet = block size."},
  {id:106,cat:"Networking",q:"Why does a bigger CIDR number mean a SMALLER subnet?",a:"A bigger CIDR number (like /28) reserves more bits for the network portion, leaving fewer bits for host addresses — fewer possible hosts means a smaller subnet.",hint:"More network bits = fewer host bits = smaller subnet."},
  {id:107,cat:"Networking",q:"What does full-duplex mean on a switch port?",a:"The port can send and receive data simultaneously, unlike half-duplex which can only do one direction at a time. Modern switches are full-duplex by default.",hint:"Full duplex = both directions at once."},
  {id:108,cat:"Networking",q:"What is a collision domain and how do switches change it?",a:"A collision domain is a network segment where data collisions can occur. Hubs share ONE collision domain for all ports. Switches give EACH port its own separate collision domain.",hint:"Switch = one collision domain per port."},
  {id:109,cat:"Networking",q:"What is a broadcast domain?",a:"A group of devices that all receive broadcast traffic sent by any one of them. Routers separate broadcast domains; switches do not (unless using VLANs).",hint:"Routers separate broadcast domains. Switches don't (without VLANs)."},
  {id:110,cat:"Networking",q:"What does a VLAN accomplish on a single physical switch?",a:"It logically splits one physical switch into multiple separate virtual networks, isolating traffic between groups of ports as if they were on entirely separate switches.",hint:"VLAN = virtual split of one physical switch."},
  {id:111,cat:"Networking",q:"What is the purpose of a default gateway?",a:"It's the router's IP address on the local network. Any traffic destined for a different network gets sent here first, since the local device doesn't know how to reach outside networks directly.",hint:"Default gateway = the exit door to other networks."},

  // ADDITIONAL — PRINTERS
  {id:112,cat:"Hardware",q:"What are the 7 steps of the laser printer imaging process, in order?",a:"1.Raster 2.Charge 3.Expose 4.Develop 5.Transfer 6.Fuse 7.Clean\nMnemonic: 'Really Cheap Electronics Don't Turn Fancy Clean'",hint:"RCEDT FC — memorize the mnemonic sentence."},
  {id:113,cat:"Hardware",q:"What does the 'Charge' step do in laser printing?",a:"A corona wire applies a uniform negative electrical charge to the photosensitive drum, preparing it for the laser to selectively discharge areas in the Expose step.",hint:"Charge = prep the drum with negative charge."},
  {id:114,cat:"Hardware",q:"What does the 'Fuse' step do and why does it need heat?",a:"Heat and pressure rollers melt the toner and permanently bond it to the paper. Without heat, toner would just brush off the page.",hint:"Fuse = heat melts toner onto paper permanently."},
  {id:115,cat:"Hardware",q:"A laser printer produces streaks or lines on every page. What's the likely cause?",a:"A dirty or damaged drum unit, low toner, or a worn fuser roller. Clean or replace the drum unit first since streaking is its classic symptom.",hint:"Streaks = usually the drum unit."},
  {id:116,cat:"Hardware",q:"An inkjet printer produces blank pages. What do you check first?",a:"Check that the protective tape/seal was removed from a new cartridge, then run a nozzle check/cleaning cycle — clogged nozzles are the most common cause.",hint:"Blank pages on inkjet = check tape, then nozzles."},

  // ADDITIONAL — MOBILE DEVICES
  {id:117,cat:"Mobile",q:"What is the range difference between Bluetooth and NFC?",a:"Bluetooth: roughly 10 meters (30 feet). NFC: a few centimeters, requiring near-contact. NFC's short range is a security feature for tap-to-pay.",hint:"Bluetooth = room-sized. NFC = inches."},
  {id:118,cat:"Mobile",q:"What is the difference between mobile hotspot and Bluetooth tethering?",a:"Hotspot: phone broadcasts its own Wi-Fi network using cellular data. Bluetooth tethering: shares the same cellular connection over a Bluetooth link instead of Wi-Fi — typically slower but uses less battery.",hint:"Hotspot=Wi-Fi broadcast. BT tether=Bluetooth link, less battery."},
  {id:119,cat:"Mobile",q:"What is an eSIM and what's its main advantage over a physical SIM?",a:"An embedded SIM built into the device rather than a removable card. It can be provisioned and switched between carriers remotely/digitally without swapping physical hardware.",hint:"eSIM = no physical card, programmed remotely."},
  {id:120,cat:"Mobile",q:"A user's phone battery drains unusually fast. What are the most common causes to check?",a:"Background app refresh, high screen brightness, GPS constantly active, and poor cellular signal (phone repeatedly searching for signal uses significant power). Check battery usage stats to identify the specific culprit app.",hint:"Check: background apps, brightness, GPS, weak signal."},
  {id:121,cat:"Mobile",q:"What does MDM allow an organization to do on employee-owned BYOD phones?",a:"Enforce security policies (PIN requirements, encryption), remotely wipe company data, manage app deployment, and monitor compliance — all typically scoped to a work profile rather than the entire personal device.",hint:"MDM on BYOD = enforce policy + remote wipe, usually work-profile scoped."},

  // ADDITIONAL — CLOUD & VIRTUALIZATION
  {id:122,cat:"Cloud/Virt",q:"What's the key difference between a Type 1 and Type 2 hypervisor?",a:"Type 1 (bare-metal) runs directly on hardware with no host OS — more efficient, used in data centers (VMware ESXi, Hyper-V). Type 2 (hosted) runs inside an existing OS — easier setup, more overhead (VirtualBox, VMware Workstation).",hint:"Type 1=no host OS, data center. Type 2=inside an OS, easier setup."},
  {id:123,cat:"Cloud/Virt",q:"Why do containers start faster than virtual machines?",a:"Containers share the host OS kernel instead of running a full separate OS like a VM does. There's no OS boot process — just the application and its dependencies starting up.",hint:"Containers share the host kernel — no separate OS boot needed."},
  {id:124,cat:"Cloud/Virt",q:"What is a VM snapshot used for?",a:"It captures the complete state of a VM at a specific point in time, allowing an instant rollback if something goes wrong — commonly taken right before a risky update or configuration change.",hint:"Snapshot = save point you can roll back to instantly."},
  {id:125,cat:"Cloud/Virt",q:"IaaS vs PaaS vs SaaS — who manages the operating system in each?",a:"IaaS: YOU manage the OS (provider gives raw infrastructure). PaaS: the PROVIDER manages the OS (you just deploy your app). SaaS: the PROVIDER manages everything, including the application itself.",hint:"IaaS=you manage OS. PaaS=provider manages OS. SaaS=provider manages all."},
  {id:126,cat:"Cloud/Virt",q:"What is VDI and how does it differ from a regular remote desktop connection?",a:"Virtual Desktop Infrastructure hosts full desktop environments centrally on servers, with users connecting via thin clients or apps. Unlike simple RDP to a single physical PC, VDI desktops are provisioned, managed, and often instantly reset centrally at scale.",hint:"VDI = centrally hosted desktops at scale, not one single remote PC."},

  // ADDITIONAL — SCENARIO-BASED (mixed domains)
  {id:127,cat:"Scenario",q:"A user's laptop won't connect to Wi-Fi but other devices connect fine. What should you check on the laptop first?",a:"Confirm Wi-Fi is enabled (not in airplane mode), check if the correct network is selected, verify the Wi-Fi adapter is enabled in Device Manager, and try forgetting/rejoining the network.",hint:"Other devices work = problem is local to this laptop, not the network."},
  {id:128,cat:"Scenario",q:"A server's RAID 5 array shows a failed drive. What is the array's current state and what should happen next?",a:"The array is in 'degraded mode' — still functional using parity data, but with zero further fault tolerance until repaired. Replace the failed drive promptly; the array will automatically rebuild using parity data from the remaining drives.",hint:"RAID 5 with 1 failed drive = degraded mode, not dead — but no more room for error."},
  {id:129,cat:"Scenario",q:"A user reports their monitor shows no signal, but the PC's fans and lights are on. What do you check first?",a:"Verify the video cable is firmly connected at both ends, try a different video port/cable, and check if the GPU (if discrete) is fully seated — the PC 'being on' doesn't confirm POST succeeded.",hint:"Powered on ≠ POST succeeded. Check cable/GPU seating first."},
  {id:130,cat:"Scenario",q:"An employee's account gets locked out repeatedly with no explanation from them. What should you investigate?",a:"Check for a saved incorrect password on another device (phone, old laptop) still trying to authenticate, or investigate for a possible brute-force attack against that account.",hint:"Repeated lockouts = often a saved bad password elsewhere, or an attack."},
  {id:131,cat:"Scenario",q:"A technician needs to securely wipe a drive before donating an old PC. What's the correct approach?",a:"Use a proper disk-wiping tool that overwrites data multiple times (or cipher /w on Windows for free space), rather than just deleting files or reformatting, which leaves data recoverable with forensic tools.",hint:"Simple delete/format ≠ secure wipe. Use overwriting tools."},
  {id:132,cat:"Scenario",q:"A user says 'the internet is down' but you find they can access internal file shares fine. What does this tell you?",a:"The local network and possibly DNS for internal resources are working. The issue is likely isolated to external/internet connectivity — check the router's WAN connection, modem, or ISP status.",hint:"Internal shares work = LAN is fine. Problem is likely WAN/internet-specific."},
  {id:133,cat:"Scenario",q:"A company wants remote employees to access internal resources securely without exposing RDP directly to the internet. What's the best practice?",a:"Require a VPN connection first, then allow RDP only over the established VPN tunnel on the internal network — never expose RDP port 3389 directly to the public internet.",hint:"VPN first, then RDP internally — never expose RDP directly."},
  {id:134,cat:"Scenario",q:"A new employee's computer can't join the domain despite correct credentials. What should you check?",a:"Verify the computer's network connection can reach the domain controller, confirm the system time isn't significantly out of sync (Kerberos fails with clock drift), and confirm the OS edition supports domain join (not Home).",hint:"Check: network path to DC, clock sync, and Windows edition."},

  // ADDITIONAL — COMMANDS & TOOLS DEEPER
  {id:135,cat:"Commands",q:"What is the difference between shutdown /s and shutdown /r?",a:"/s shuts the computer down completely. /r restarts it (shuts down then powers back on automatically).",hint:"/s=shutdown, /r=restart."},
  {id:136,cat:"Commands",q:"What does gpresult /r show you?",a:"Which Group Policies are currently applied to the logged-in user and computer — useful for diagnosing why an expected policy setting isn't taking effect.",hint:"gpresult /r = show which policies actually applied."},
  {id:137,cat:"Commands",q:"What's the risk of using rm -rf on Linux compared to Windows' del?",a:"rm -rf recursively force-deletes a directory and ALL its contents immediately with no recycle bin and typically no confirmation prompt — much more dangerous than Windows' del for a typical file, which usually goes to the Recycle Bin.",hint:"rm -rf = permanent, recursive, no undo. Much more dangerous than del."},
  {id:138,cat:"Commands",q:"What does the Linux command chmod 755 actually set?",a:"Owner gets read+write+execute (7), group gets read+execute (5), others get read+execute (5). Numbers map to permission bits: 4=read, 2=write, 1=execute, summed together.",hint:"7=rwx, 5=r-x. Owner/Group/Other in that order."},
  {id:139,cat:"Commands",q:"What is the purpose of the Windows Event Viewer, and which logs matter most for troubleshooting?",a:"It records system events, errors, and warnings. The System log (hardware/driver/OS issues) and Application log (program-specific crashes/errors) are the two most useful for general troubleshooting.",hint:"Event Viewer: System log = OS/hardware. Application log = program errors."},
  {id:140,cat:"Commands",q:"When would you use robocopy instead of a simple copy command?",a:"For backups or large transfers — robocopy handles open files gracefully, automatically retries failed copies, and can mirror directory structures, none of which basic copy/xcopy do reliably.",hint:"robocopy = built for backups: retries, handles open files, mirrors dirs."},

  // ADDITIONAL — SECURITY DEEPER
  {id:141,cat:"Security",q:"What is the difference between authentication and authorization?",a:"Authentication verifies WHO you are (login with username/password). Authorization determines WHAT you're allowed to do once verified (permissions, access levels).",hint:"Authentication=who you are. Authorization=what you can do."},
  {id:142,cat:"Security",q:"What is 'least privilege' and why does it matter?",a:"Giving users only the minimum permissions needed to do their specific job — nothing more. It limits the damage if an account is compromised, since the attacker inherits only that limited access.",hint:"Least privilege = minimum access needed, nothing extra."},
  {id:143,cat:"Security",q:"What is defense in depth?",a:"Using multiple overlapping layers of security controls (firewall, antivirus, MFA, physical security, etc.) so that if one layer fails, others still provide protection — no single point of failure.",hint:"Defense in depth = multiple layers, no single point of failure."},
  {id:144,cat:"Security",q:"What makes an Evil Twin access point dangerous?",a:"It's a rogue Wi-Fi access point broadcasting the same SSID as a legitimate network, tricking users into connecting to it instead — letting the attacker intercept all their traffic.",hint:"Evil Twin = fake AP with the same name as the real one."},
  {id:145,cat:"Security",q:"What is the difference between a virus and a worm in how they spread?",a:"A virus needs a host file and typically requires user action (opening an infected file) to spread. A worm self-replicates across a network entirely on its own, with no host file or user action needed.",hint:"Virus needs a host file + user action. Worm spreads itself, no host needed."},
  {id:146,cat:"Security",q:"What does 'non-repudiation' mean in security?",a:"Proof that a specific action was performed by a specific party, such that they cannot credibly deny having done it. Digital signatures are a common way to achieve this.",hint:"Non-repudiation = can't deny you did it. Digital signatures provide this."},
  {id:147,cat:"Security",q:"What is a zero-day vulnerability?",a:"A security flaw that is unknown to the vendor and has no available patch yet. It's called 'zero-day' because defenders have had zero days to prepare a fix.",hint:"Zero-day = unknown flaw, no patch exists yet."},
  {id:148,cat:"Security",q:"Why is SQL injection dangerous, and what's the primary defense?",a:"It lets an attacker insert malicious SQL code through an input field to manipulate or extract data from a database. The primary defense is using parameterized queries (prepared statements) instead of directly inserting user input into SQL commands.",hint:"SQL injection = malicious code via input fields. Defense = parameterized queries."},

  // ADDITIONAL — WINDOWS / OS DEEPER
  {id:149,cat:"OS/Windows",q:"What is the Windows Registry and what are its five main hives?",a:"A hierarchical database storing all OS and application configuration settings. Five hives: HKLM (whole machine), HKCU (current user), HKCR (file associations), HKU (all user profiles), HKCC (current hardware profile).",hint:"5 hives: HKLM, HKCU, HKCR, HKU, HKCC."},
  {id:150,cat:"OS/Windows",q:"What is Safe Mode and when would you use it?",a:"A minimal Windows boot state that loads only essential drivers and services. Used to troubleshoot issues caused by a problematic driver, startup program, or malware, since those things typically don't load in Safe Mode.",hint:"Safe Mode = minimal drivers/services, isolates the problem."},
  {id:151,cat:"OS/Windows",q:"What does msconfig let you control?",a:"Boot options (including Safe Mode), startup programs, and services — a general system configuration troubleshooting tool, though Task Manager's Startup tab has largely replaced its startup-program management role.",hint:"msconfig = boot options, startup, services."},
  {id:152,cat:"OS/Windows",q:"What is Windows Sandbox and what edition is it available on?",a:"A lightweight, temporary, isolated desktop environment for safely testing untrusted software — everything is discarded when closed. Available on Windows Pro and Enterprise only, not Home.",hint:"Windows Sandbox = disposable test environment, Pro/Enterprise only."},
  {id:153,cat:"OS/Windows",q:"What's the difference between a local account and a Microsoft account on Windows?",a:"A local account exists only on that specific machine with no cloud sync. A Microsoft account syncs settings, files (via OneDrive), and app licenses across all devices signed in with it.",hint:"Local=this machine only. Microsoft account=syncs across devices."},

  // ADDITIONAL — OPERATIONAL PROCEDURES DEEPER
  {id:154,cat:"Ops",q:"What is a rollback plan and why must you have one before making a change?",a:"A predetermined plan to undo a change and restore the previous working state if the change causes problems. It must exist BEFORE implementing the change, not improvised afterward under pressure.",hint:"Rollback plan = made BEFORE the change, not improvised after."},
  {id:155,cat:"Ops",q:"What is the purpose of a maintenance window?",a:"A pre-scheduled time period (often overnight or during low-usage hours) for making system changes, minimizing disruption to users during business-critical hours.",hint:"Maintenance window = scheduled low-impact time for changes."},
  {id:156,cat:"Ops",q:"What is proper procedure for handling and disposing of a CRT monitor?",a:"CRT monitors contain leaded glass and should never be broken open — they must go through specialized electronics recycling, not regular trash, due to hazardous materials.",hint:"CRT monitors = hazardous materials, never regular trash."},
  {id:157,cat:"Ops",q:"What should be documented after completing any IT change or repair?",a:"What was changed, when, by whom, why, what the outcome was, and any follow-up steps needed. This creates an audit trail and helps future troubleshooting if related issues arise.",hint:"Document: what, when, who, why, outcome, follow-up."},
  {id:158,cat:"Ops",q:"What is the difference between OEM and Retail Windows licensing in practice?",a:"OEM licenses are tied permanently to the first piece of hardware they're activated on and cannot be transferred. Retail licenses can be deactivated and moved to a different machine (within the license terms).",hint:"OEM=stuck to first hardware forever. Retail=transferable."},

  // ADDITIONAL — HARDWARE DEEPER DRILLS
  {id:159,cat:"Hardware",q:"What is thermal paste for, and why does it need periodic replacement?",a:"It fills microscopic gaps between the CPU and heatsink to improve heat transfer. Over years it dries out and loses effectiveness, which is a common cause of gradually worsening overheating in older systems.",hint:"Thermal paste fills gaps for heat transfer; dries out over years."},
  {id:160,cat:"Hardware",q:"What is the significance of dual-channel RAM configuration?",a:"Installing two matched RAM sticks (rather than one single stick of the same total capacity) lets the memory controller access both simultaneously, roughly doubling memory bandwidth compared to single-channel.",hint:"Dual-channel = two matched sticks, more bandwidth than one big stick."},
  {id:161,cat:"Hardware",q:"Why can't you simply swap an AMD CPU into an Intel motherboard, or vice versa?",a:"They use entirely different, physically incompatible socket types and different chipset architectures — there's no adapter or workaround; the motherboard must match the CPU manufacturer and specific socket generation.",hint:"AMD and Intel use different, incompatible sockets — no adapters exist."},
  {id:162,cat:"Hardware",q:"What does a motherboard's chipset actually govern?",a:"It determines which features are available: number of USB ports, PCIe lane allocation, RAM speed support, overclocking capability, and which CPUs are compatible — the CPU and chipset must be compatible generations.",hint:"Chipset = governs available features, connectivity, and CPU compatibility."},
  {id:163,cat:"Hardware",q:"What is the purpose of a UPS (Uninterruptible Power Supply)?",a:"It provides battery backup power during outages (enough time to save work and shut down gracefully) and also conditions/filters incoming power to protect against surges and brownouts.",hint:"UPS = battery backup + power conditioning/surge protection."},

  // ADDITIONAL — MORE PORT/PROTOCOL DRILLS
  {id:164,cat:"Ports",q:"What port range is considered 'well-known' and reserved for standard services?",a:"Ports 0-1023 are well-known/reserved ports (HTTP, HTTPS, SSH, FTP, etc. all live here). Ports 1024-49151 are registered ports, and 49152-65535 are dynamic/ephemeral ports used for temporary client connections.",hint:"0-1023 = well-known. 1024-49151 = registered. 49152+ = ephemeral."},
  {id:165,cat:"Ports",q:"What is an ephemeral port and when is it used?",a:"A temporary, high-numbered port (typically 49152-65535) automatically assigned to the CLIENT side of a connection for the duration of that session — not the well-known port the server listens on.",hint:"Ephemeral port = temporary client-side port for one session."},
  {id:166,cat:"Ports",q:"Why do many ISPs block outbound port 25 by default for home connections?",a:"To prevent spam — port 25 is used for server-to-server email relay, and blocking it stops compromised home devices from being used to send spam directly. Legitimate users send email via port 587 instead.",hint:"ISPs block 25 to fight spam; users should use 587 for sending mail."},

  // ADDITIONAL — VPN / ENCRYPTION DEEPER
  {id:167,cat:"Security",q:"What's the difference between symmetric and asymmetric encryption?",a:"Symmetric: same key encrypts and decrypts — fast, but sharing the key securely is a challenge. Asymmetric: a public key encrypts, a different private key decrypts — solves the key-sharing problem but is slower.",hint:"Symmetric=one shared key, fast. Asymmetric=public/private pair, slower."},
  {id:168,cat:"Security",q:"How do VPNs typically combine symmetric and asymmetric encryption?",a:"Asymmetric encryption is used briefly during connection setup to securely exchange a symmetric session key. Then symmetric encryption (like AES) handles the actual bulk data transfer, since it's much faster.",hint:"Asymmetric sets up the connection; symmetric (AES) handles the actual data."},
  {id:169,cat:"Security",q:"What does WireGuard offer that makes it notable compared to older VPN protocols?",a:"A dramatically smaller codebase (~4,000 lines vs OpenVPN's 70,000+), making it easier to audit for security flaws, while also being faster due to modern, efficient cryptography.",hint:"WireGuard = small codebase, easy to audit, fast, modern crypto."},

  // ADDITIONAL — MORE FLASHCARDS: RAID/BACKUP SCENARIOS
  {id:170,cat:"Scenario",q:"A company needs storage that survives two simultaneous drive failures. Which RAID level and minimum drives?",a:"RAID 6, minimum 4 drives. It uses double distributed parity, allowing it to survive exactly two drives failing at once, unlike RAID 5 which only survives one.",hint:"Survive 2 failures = RAID 6, needs 4+ drives."},
  {id:171,cat:"Scenario",q:"A backup job needs to run fast every night, and full restore speed isn't a top priority since disasters are rare. Which backup type fits best?",a:"Incremental backups — fastest to create each night since they only capture changes since the last backup of any type. Restore speed is slower, but that tradeoff is acceptable here per the stated priorities.",hint:"Fast nightly backups, restore speed less critical = incremental."},
  {id:172,cat:"Scenario",q:"A hospital needs both fast nightly backups AND fast restores in an emergency. What's the best backup strategy?",a:"Weekly full backup plus nightly differential backups. Restores only need the last full plus the single latest differential — much faster than incremental chains — while nightly backup windows stay reasonably short.",hint:"Need both fast backup AND fast restore = full + differential combo."},

  // ADDITIONAL — SCRIPTING & AUTOMATION
  {id:173,cat:"Ops",q:"What is the main advantage of PowerShell over classic Batch scripting on Windows?",a:"PowerShell is object-oriented (passes structured data between commands, not just plain text) and has full access to .NET, making it far more powerful for complex automation and system administration tasks.",hint:"PowerShell = object-oriented, full .NET access. Batch = plain text only."},
  {id:174,cat:"Ops",q:"What does a script's 'exit code' of 0 typically indicate?",a:"Success. By convention across nearly all scripting languages and command-line tools, an exit code of 0 means the command completed without error; any non-zero value indicates some kind of failure.",hint:"Exit code 0 = success. Non-zero = some kind of error occurred."},

  // ADDITIONAL — MORE ON WIRELESS
  {id:175,cat:"Networking",q:"What does MU-MIMO stand for and what does it improve?",a:"Multi-User, Multiple Input Multiple Output. It lets a Wi-Fi access point communicate with several devices simultaneously using multiple antennas, instead of serving devices one at a time.",hint:"MU-MIMO = serve multiple devices at once via multiple antennas."},
  {id:176,cat:"Networking",q:"What is OFDMA and which Wi-Fi generation introduced it?",a:"Orthogonal Frequency-Division Multiple Access — introduced with 802.11ax (Wi-Fi 6). It divides a single channel into smaller sub-channels so multiple devices can be served simultaneously, greatly improving performance in dense, high-device-count environments.",hint:"OFDMA = Wi-Fi 6 feature, splits channels for better dense-area performance."},

  // ADDITIONAL — FILE SYSTEMS & STORAGE DEEPER
  {id:177,cat:"OS/Windows",q:"Why can't ReFS be used as a Windows boot volume?",a:"ReFS was designed for data integrity and resilience on storage volumes, not for the specific boot-time requirements Windows needs from its system volume — Microsoft has not enabled it as a bootable option.",hint:"ReFS = data volumes only, not bootable."},
  {id:178,cat:"OS/Windows",q:"What is journaling in a file system, and why does it matter?",a:"The file system keeps a log ('journal') of changes before actually committing them. If the system crashes mid-write, the journal allows recovery to a consistent state rather than leaving corrupted data. NTFS, ext4, and XFS are all journaling file systems.",hint:"Journaling = logs changes before committing, enables crash recovery."},
  {id:179,cat:"OS/Windows",q:"Why is exFAT often preferred over FAT32 for large USB drives today?",a:"exFAT removes FAT32's 4GB single-file size limit while still maintaining broad cross-platform compatibility across Windows, Mac, and many other devices — without NTFS's added complexity or licensing considerations.",hint:"exFAT = FAT32's compatibility, without the 4GB file size limit."},

  // ADDITIONAL — TROUBLESHOOTING METHODOLOGY DEEPER
  {id:180,cat:"Troubleshoot",q:"Why does CompTIA's troubleshooting methodology put 'document findings' as the very last step?",a:"Documentation happens after the fix is verified working, capturing the complete accurate picture: the problem, the theory, the actual fix, and confirmation it worked — rather than documenting assumptions before they're confirmed correct.",hint:"Document last = after you know the fix actually worked, not before."},
  {id:181,cat:"Troubleshoot",q:"What's the danger of skipping straight to 'implement a fix' without testing your theory first?",a:"You might implement a fix for the wrong root cause, appearing to solve the symptom temporarily while missing the actual underlying issue — which will likely recur.",hint:"Skip testing theory = risk fixing the wrong thing, problem recurs."},
  {id:182,cat:"Troubleshoot",q:"A computer randomly reboots under heavy load (gaming, video rendering) but is stable at idle. What's the most likely cause?",a:"Overheating (check thermal paste, fans, airflow) or an insufficient/failing power supply unable to sustain peak load — both are classic causes of load-triggered instability.",hint:"Random reboots under load = thermal issue or failing/undersized PSU."},

  // ADDITIONAL — MORE MALWARE/SOCIAL ENGINEERING
  {id:183,cat:"Security",q:"What is a botnet and what is it typically used for?",a:"A network of malware-compromised devices ('bots') controlled remotely by an attacker's command-and-control server, commonly used to launch DDoS attacks or send spam at scale.",hint:"Botnet = many hijacked devices under one attacker's control."},
  {id:184,cat:"Security",q:"What is the key difference between vishing and smishing?",a:"Vishing is phishing conducted via a phone call (voice). Smishing is phishing conducted via SMS text message. Both trick a human into giving up information or clicking malicious links — the delivery channel is the only difference.",hint:"Vishing=voice call. Smishing=SMS text. Same trick, different channel."},
  {id:185,cat:"Security",q:"What is tailgating in a physical security context?",a:"Following an authorized person through a secured door without independently badging in yourself — exploiting politeness or inattention to bypass physical access controls.",hint:"Tailgating = sneaking through a secure door behind someone authorized."},
  {id:186,cat:"Security",q:"Why is dumpster diving still considered a real security risk?",a:"Discarded documents, old hard drives, or sticky notes can contain passwords, account numbers, or other sensitive data that attackers can retrieve simply by searching trash — a low-tech but effective information-gathering method.",hint:"Dumpster diving = low-tech but real risk from improperly discarded info."},
  {id:187,cat:"Security",q:"What does AAA stand for and what does each letter mean?",a:"Authentication (proving who you are), Authorization (checking what you're allowed to do once verified), Accounting (logging everything that happened). All three happen in that exact order.",hint:"AAA = Authentication, Authorization, Accounting — always in that order."},
  {id:188,cat:"Security",q:"In the AAA framework, what is a Supplicant?",a:"The device or client trying to gain access to the network — e.g., a laptop trying to join a secured Wi-Fi network. It's the one requesting access, not the one granting it.",hint:"Supplicant = the device asking to get in."},
  {id:189,cat:"Security",q:"In the AAA framework, what is a Network Access Device (Authenticator)?",a:"The switch, access point, or VPN concentrator the supplicant connects through. It does NOT make access decisions itself — it forwards credentials to the AAA server and enforces whatever decision comes back.",hint:"Network Access Device = the middleman, forwards credentials, doesn't decide."},
  {id:190,cat:"Security",q:"What is the Accounting piece of AAA actually used for?",a:"Keeping a log of everything: when a user logged in, what they accessed, how long they were connected, and when they logged out. Used for auditing, billing, and security investigations after the fact.",hint:"Accounting = the paper trail, not a decision-making step."},
  {id:191,cat:"Networking",q:"What port does Telnet use and why was it replaced?",a:"Port 23. It sends everything — including login credentials — in plaintext. SSH (port 22) replaced it because SSH encrypts the entire session.",hint:"Telnet = 23, plaintext, replaced by SSH."},
  {id:192,cat:"Networking",q:"What is the key difference between SSH/Telnet and RDP as remote access tools?",a:"SSH and Telnet provide text-based (command line) remote access. RDP provides full graphical (GUI) remote access to the entire desktop, not just a command line.",hint:"SSH/Telnet = text/CLI. RDP = full graphical desktop."},
  {id:193,cat:"Mobile",q:"What are the two most common ways to control IoT smart devices?",a:"A smart speaker (voice-activated hub controlling devices without a screen) or a smartphone app / web-based management dashboard, often tied to the device's own cloud account.",hint:"IoT control = smart speaker (voice) or app/web dashboard."},
  {id:194,cat:"Mobile",q:"Why should IoT devices be placed on a separate network VLAN?",a:"IoT devices frequently run outdated firmware and are rarely patched, making them common attack targets. Isolating them on their own VLAN prevents a compromised IoT device from reaching sensitive resources on the main network.",hint:"IoT devices = often unpatched. Isolate them on their own VLAN."},
  {id:195,cat:"Troubleshoot",q:"A user's PC can't reach the network. How do you determine if it's a single-host problem or a broader network problem?",a:"Check whether other devices on the same segment are also affected. If only one host has the issue, suspect that device's NIC, cable, or IP config. If multiple hosts are affected, suspect the switch, router, or upstream connection.",hint:"One host affected = local issue. Many hosts affected = switch/router/upstream issue."},
  {id:196,cat:"Troubleshoot",q:"A host can reach local file shares and printers but not the internet. What does this narrow down?",a:"The LAN itself is healthy. The problem is upstream — check the default gateway, DNS configuration, or the connection to the ISP, not the local network cabling or switch.",hint:"Local works, internet doesn't = look upstream (gateway/DNS/ISP), not local."},
  {id:197,cat:"Troubleshoot",q:"A device is physically connected but can't reach expected network resources. What two switch-port-level things should you check?",a:"Confirm it's connected to the correct switch/switch port (not a disabled or misconfigured one), and confirm that port is configured with the correct VLAN — a device on the wrong VLAN is logically on the wrong network even with a perfect physical connection.",hint:"Check: correct switch port, and correct VLAN assignment on that port."},
];

// ─── EXAM SIMULATOR QUESTIONS (30 scenario-based) ───────────────────────────
const EXAM_QUESTIONS=[
  {id:1,domain:"Core 1 — Networking",diff:"medium",
   q:"A technician runs ipconfig on a workstation and sees the IP address 169.254.45.12. Which of the following is the MOST likely cause?",
   opts:["The workstation was assigned a static IP","The DHCP server is unavailable","The DNS server is not responding","The default gateway is misconfigured"],
   a:1,
   exp:"169.254.x.x is an APIPA address. Windows self-assigns this when it cannot reach a DHCP server. Verify DHCP server status and network connectivity.",
   hint:"APIPA range starts with 169.254."},
  {id:2,domain:"Core 2 — OS",diff:"medium",
   q:"A technician needs to repair corrupted Windows system files. After running sfc /scannow, the tool reports that it could not fix all errors. What should the technician do NEXT?",
   opts:["Run chkdsk /r","Run DISM /Online /Cleanup-Image /RestoreHealth and then sfc /scannow again","Reinstall Windows","Run bootrec /fixmbr"],
   a:1,
   exp:"SFC depends on the Windows image store. If the image is corrupted, SFC can't fix files. DISM repairs the image first, then SFC can successfully repair system files.",
   hint:"SFC failed = the image it relies on is corrupted. DISM fixes the image."},
  {id:3,domain:"Core 1 — Hardware",diff:"easy",
   q:"Which RAID level requires a minimum of 3 drives, provides fault tolerance for one drive failure, and distributes parity across all drives?",
   opts:["RAID 0","RAID 1","RAID 5","RAID 10"],
   a:2,
   exp:"RAID 5 requires 3+ drives, distributes parity across all drives, and tolerates exactly one drive failure. N-1 drives worth of space is usable for data.",
   hint:"3 drives minimum + distributed parity + 1 failure tolerance = RAID 5."},
  {id:4,domain:"Core 2 — Security",diff:"medium",
   q:"A user reports that all files on their workstation have been encrypted and they see a message demanding bitcoin payment. Which type of malware is this?",
   opts:["Spyware","Worm","Ransomware","Trojan"],
   a:2,
   exp:"Ransomware encrypts files and demands payment. Correct response: isolate the system, restore from clean backup. Never pay — it encourages attackers and doesn't guarantee decryption.",
   hint:"Encrypted files + payment demand = ransomware."},
  {id:5,domain:"Core 1 — Networking",diff:"hard",
   q:"Which of the following subnet masks allows for 62 usable host addresses per subnet?",
   opts:["255.255.255.192","255.255.255.224","255.255.255.240","255.255.255.128"],
   a:0,
   exp:"255.255.255.192 = /26. Host bits = 6. 2^6 = 64 total. 64-2 = 62 usable. /27=30 usable. /28=14 usable. /25=126 usable.",
   hint:"62 usable = 64 total - 2 = 2^6 host bits = /26 = 255.255.255.192"},
  {id:6,domain:"Core 2 — Security",diff:"medium",
   q:"A technician needs to ensure that deleted files cannot be forensically recovered from a decommissioned workstation drive. Which command accomplishes this?",
   opts:["chkdsk /r C:","sfc /scannow","cipher /w:C","takeown /f C:\\"],
   a:2,
   exp:"cipher /w:C overwrites all free space on the C: drive with zeros, preventing forensic recovery of deleted files. It does NOT encrypt the drive.",
   hint:"cipher /w = wipe free space. NOT encryption."},
  {id:7,domain:"Core 1 — Hardware",diff:"medium",
   q:"A technician is installing a new SSD in a laptop. The laptop has an M.2 slot. The technician needs the FASTEST possible storage option. Which type should they choose?",
   opts:["M.2 SATA SSD","M.2 NVMe PCIe SSD","2.5-inch SATA SSD","USB 3.0 external SSD"],
   a:1,
   exp:"NVMe PCIe uses the PCIe bus directly, achieving 3,000-7,000+ MB/s. M.2 SATA is limited to ~600 MB/s. Both use M.2 form factor but different interfaces.",
   hint:"NVMe PCIe = fastest. SATA M.2 = fast but limited by SATA bus."},
  {id:8,domain:"Core 1 — Networking",diff:"easy",
   q:"A user is setting up a home network. They want to share files between Windows computers. Which port must be open on the firewall to allow Windows file sharing?",
   opts:["Port 80","Port 443","Port 445","Port 3389"],
   a:2,
   exp:"SMB/CIFS uses port 445 TCP for Windows file and printer sharing. RDP is 3389. HTTP is 80. HTTPS is 443.",
   hint:"Windows file sharing = SMB = 445."},
  {id:9,domain:"Core 2 — OS",diff:"medium",
   q:"A user on Windows 10 Home wants to join their computer to the corporate Active Directory domain. What should the technician inform the user?",
   opts:["It can be done from System Properties","It requires a registry edit","Windows Home does not support domain join — requires Pro or higher","It requires downloading Active Directory tools"],
   a:2,
   exp:"Domain join is a Windows Pro/Enterprise feature only. Windows Home cannot join an Active Directory domain. The user needs to upgrade to Pro.",
   hint:"Domain join = Pro feature. Home cannot join AD."},
  {id:10,domain:"Core 1 — Hardware",diff:"easy",
   q:"A technician is connecting a server to a fiber switch using a small hot-swappable module that converts between fiber optic and the switch's electrical interface. What is this module called?",
   opts:["RJ45","BNC connector","SFP/SFP+ transceiver","LC connector"],
   a:2,
   exp:"SFP (Small Form-Factor Pluggable) and SFP+ are hot-swappable transceiver modules used in switches and routers to connect fiber or copper cables.",
   hint:"Hot-swappable fiber module for switches = SFP."},
  {id:11,domain:"Core 2 — Security",diff:"medium",
   q:"Which VPN protocol provides tunneling only and MUST be paired with IPsec to provide encryption?",
   opts:["OpenVPN","SSL VPN","L2TP","WireGuard"],
   a:2,
   exp:"L2TP (Layer 2 Tunneling Protocol) provides tunneling only with ZERO built-in encryption. L2TP/IPsec is the secure combination. OpenVPN and WireGuard have built-in encryption.",
   hint:"L2TP alone = no encryption. Needs IPsec."},
  {id:12,domain:"Core 2 — Software Troubleshoot",diff:"medium",
   q:"A user reports that Windows boots to a blank screen with a cursor. Which boot option should the technician try FIRST?",
   opts:["Disable automatic restart","Boot to Safe Mode","Run chkdsk","Perform a factory reset"],
   a:1,
   exp:"Safe Mode loads Windows with minimal drivers. This isolates whether the issue is a driver, startup app, or core OS issue. It's the safest first step before more drastic measures.",
   hint:"Blank screen on boot = try Safe Mode first."},
  {id:13,domain:"Core 1 — Networking",diff:"hard",
   q:"A host has IP address 192.168.10.100 with subnet mask 255.255.255.192. What is the broadcast address for this subnet?",
   opts:["192.168.10.127","192.168.10.191","192.168.10.255","192.168.10.63"],
   a:0,
   exp:"/26 mask. Block size=64. Subnets start at .0, .64, .128, .192. Host .100 is in the .64 subnet. Network=.64, Broadcast=.127, Usable=.65-.126.",
   hint:"255.255.255.192 = /26. Block size 64. .100 is in .64 subnet. Broadcast=.64+63=.127"},
  {id:14,domain:"Core 2 — Security",diff:"medium",
   q:"An employee receives an email that appears to be from their CEO asking them to immediately wire transfer $50,000 to a new vendor. This is MOST likely what type of attack?",
   opts:["Ransomware","Phishing / Business Email Compromise","Vishing","SQL Injection"],
   a:1,
   exp:"This is spear phishing / Business Email Compromise (BEC). Attackers impersonate executives to trick employees into financial transfers. Verify ALL financial requests through a separate communication channel.",
   hint:"Fake CEO email requesting money = phishing/BEC."},
  {id:15,domain:"Core 1 — Hardware",diff:"easy",
   q:"A technician notices a yellow exclamation mark next to a device in Device Manager. What does this MOST likely indicate?",
   opts:["The device is functioning correctly","The device has a driver issue or resource conflict","The device needs to be updated","The device is powered off"],
   a:1,
   exp:"Yellow ! in Device Manager indicates a driver issue, resource conflict, or the device is not working properly. Steps: update driver, roll back driver, or reinstall.",
   hint:"Yellow ! = driver problem or resource conflict."},
  {id:16,domain:"Core 2 — Ops Procedures",diff:"medium",
   q:"A technician is about to apply a critical update to a production server. According to best practices, what should be done BEFORE making the change?",
   opts:["Notify all users immediately after","Apply the change and document it","Go through change management — get approval, test in staging, create rollback plan","Restart the server first to clear memory"],
   a:2,
   exp:"Change management requires: request → impact assessment → approval → test in non-production → schedule maintenance window → implement → verify → document. Always have a rollback plan.",
   hint:"Before changing production = change management process."},
  {id:17,domain:"Core 1 — Networking",diff:"medium",
   q:"Which wireless security protocol uses SAE (Simultaneous Authentication of Equals) and provides stronger security than its predecessor?",
   opts:["WEP","WPA","WPA2","WPA3"],
   a:3,
   exp:"WPA3 introduced SAE (also called Dragonfly), which provides forward secrecy and resistance to offline dictionary attacks even with weak passwords.",
   hint:"SAE = WPA3."},
  {id:18,domain:"Core 2 — OS",diff:"medium",
   q:"A technician needs to check which applications start automatically with Windows. Which tool provides the MOST comprehensive view of startup items?",
   opts:["msconfig (System Configuration)","Task Manager Startup tab","Both are equivalent","Regedit HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"],
   a:1,
   exp:"Task Manager's Startup tab shows startup impact ratings. msconfig shows similar data but Task Manager in Windows 10/11 is considered the primary tool. Both work for the exam.",
   hint:"Startup programs = Task Manager Startup tab (modern) or msconfig."},
  {id:19,domain:"Core 1 — Hardware",diff:"medium",
   q:"A network technician needs to connect a laptop wirelessly to a corporate network but notices the available network requires 802.1X authentication. What infrastructure component handles this authentication?",
   opts:["DNS server","DHCP server","RADIUS server","Proxy server"],
   a:2,
   exp:"802.1X (WPA2/3 Enterprise) uses RADIUS (Remote Authentication Dial-in User Server) to authenticate each user individually. Each user gets their own credentials.",
   hint:"802.1X enterprise authentication = RADIUS server."},
  {id:20,domain:"Core 2 — Security",diff:"hard",
   q:"A security analyst discovers malware that has modified the Windows boot loader and hides itself by intercepting OS calls, making it invisible to the running OS. This is MOST likely which type of malware?",
   opts:["Keylogger","Trojan","Rootkit","Worm"],
   a:2,
   exp:"A rootkit operates at the kernel/boot level, intercepts OS calls to hide itself from antivirus running within the OS. Requires offline/bootable scanner to detect and remove.",
   hint:"Hides from running OS by intercepting system calls = rootkit."},
  {id:21,domain:"Core 1 — Cloud/Virt",diff:"easy",
   q:"A company wants to use cloud services where the provider manages all infrastructure and the company just uses productivity applications like email and word processing. Which cloud model is this?",
   opts:["IaaS","PaaS","SaaS","Private Cloud"],
   a:2,
   exp:"SaaS (Software as a Service) — provider manages everything including the application. Users just access the service (Microsoft 365, Google Workspace).",
   hint:"Just use the app = SaaS."},
  {id:22,domain:"Core 1 — Mobile",diff:"easy",
   q:"A user's phone shows it received an IP of 192.168.1.5 but later cannot get internet. After checking, they realize their phone is using more data than expected because it's creating a Wi-Fi network. What feature is active?",
   opts:["NFC","Mobile hotspot","Bluetooth tethering","Wi-Fi calling"],
   a:1,
   exp:"Mobile hotspot broadcasts a Wi-Fi network from the phone's cellular connection. Other devices connect to it, using the phone's cellular data plan.",
   hint:"Phone broadcasting Wi-Fi using cellular = hotspot."},
  {id:23,domain:"Core 2 — Software Troubleshoot",diff:"medium",
   q:"A user reports that their browser homepage keeps changing to an unfamiliar site and they see pop-up ads constantly. Which type of malware is MOST likely responsible?",
   opts:["Ransomware","Rootkit","Browser hijacker / Adware","Worm"],
   a:2,
   exp:"Browser hijacker/adware changes browser settings (homepage, search engine) and displays unwanted ads. Often bundled with free downloads. Remove via Programs & Features, clean browser extensions.",
   hint:"Homepage changed + pop-ups = browser hijacker/adware."},
  {id:24,domain:"Core 1 — Networking",diff:"medium",
   q:"Which command on Windows shows ALL running processes with their Process ID (PID) AND the executable file responsible?",
   opts:["netstat -ano","tasklist","netstat -anb","taskkill"],
   a:2,
   exp:"netstat -anb shows all connections AND the executable/program using each connection/port. tasklist shows processes by PID but not which port they use.",
   hint:"netstat -anb = connections + executable. b=binary/executable."},
  {id:25,domain:"Core 2 — Ops Procedures",diff:"easy",
   q:"Which backup type backs up ALL data every time it runs, regardless of when files were last modified?",
   opts:["Incremental","Differential","Full","Snapshot"],
   a:2,
   exp:"Full backup copies ALL selected data every run. Slowest to back up but fastest to restore (only one set needed). Other types depend on a full backup as a baseline.",
   hint:"ALL data every time = Full backup."},
  {id:26,domain:"Core 1 — Hardware",diff:"medium",
   q:"A technician is replacing a failed drive in a RAID 5 array that has 5 drives. After replacing, what must be done?",
   opts:["The array automatically recovers; nothing needed","Rebuild the array using RAID management software","Replace all drives immediately","The data is permanently lost — restore from backup"],
   a:1,
   exp:"After hot-swap (or cold-swap) replacement, RAID 5 rebuilds automatically using the parity data from remaining drives. This takes time and the array is in degraded mode during rebuild.",
   hint:"RAID 5 with 1 failed = degraded, but can rebuild from parity."},
  {id:27,domain:"Core 2 — Security",diff:"medium",
   q:"A user receives a call from someone claiming to be from IT support, asking for their username and password to 'fix an issue.' This is an example of which attack?",
   opts:["Phishing","Vishing","SQL Injection","Tailgating"],
   a:1,
   exp:"Vishing (Voice Phishing) — attackers call pretending to be IT/support/bank to get credentials. Policy: NEVER give credentials over phone. Real IT won't ask for your password.",
   hint:"Phone call asking for credentials = vishing."},
  {id:28,domain:"Core 1 — Networking",diff:"easy",
   q:"A technician uses a tool that sends a tone through a cable so it can be traced and identified among many cables in a wall or ceiling. What tool is this?",
   opts:["Cable tester","Crimping tool","Tone generator and probe (inductive tracer)","Visual Fault Locator"],
   a:2,
   exp:"Tone generator and inductive probe — the generator sends a tone on the cable, the probe detects it through walls/ceilings without needing to touch the cable directly.",
   hint:"Trace cable through walls without touching = tone gen + probe."},
  {id:29,domain:"Core 2 — OS",diff:"hard",
   q:"A Windows 11 installation fails, showing an error that the PC doesn't meet minimum requirements. The technician verifies the CPU and RAM meet specs. What are the TWO most likely missing requirements?",
   opts:["DirectX 12 and 4GB RAM","TPM 2.0 and Secure Boot enabled in UEFI","UEFI and SSD storage","64-bit CPU and 8GB RAM"],
   a:1,
   exp:"Windows 11 requires BOTH TPM 2.0 (security chip) AND Secure Boot enabled in UEFI firmware. These are the most commonly missing requirements on older hardware.",
   hint:"Win11 mandatory: TPM 2.0 + Secure Boot."},
  {id:30,domain:"Core 1 — Hardware",diff:"medium",
   q:"A company wants to implement a storage solution that provides the BEST combination of performance AND fault tolerance. Budget allows for 4 drives. Which RAID level should be recommended?",
   opts:["RAID 0","RAID 1","RAID 5","RAID 10"],
   a:3,
   exp:"RAID 10 (stripe of mirrors) with 4 drives provides excellent read/write performance AND can survive one drive failure per mirrored pair. Best combined solution when budget allows.",
   hint:"Best performance + best protection = RAID 10. Needs 4 drives."},
];

// ─── PBQ DATA (Performance-Based Questions) ──────────────────────────────────
// Real A+ exams use 1-10 PBQs at the START of the exam: ordering, matching, drag-drop.
// These simulate that experience — order steps correctly, or match items to categories.

const PBQ_ORDERING=[
  {id:"o1",title:"CompTIA Troubleshooting Methodology",
   instructions:"Drag the steps into the CORRECT order following CompTIA's official troubleshooting methodology.",
   items:["Establish a theory of probable cause","Identify the problem","Test the theory to determine cause","Establish a plan of action & implement the solution","Verify full system functionality","Document findings, actions, and outcomes"],
   correct:[1,0,2,3,4,5], // index into items[] representing correct order
   domain:"Core 1/2 — Troubleshooting Methodology"},
  {id:"o2",title:"DISM and SFC Repair Order",
   instructions:"Drag these repair commands into the order they should be run to fix corrupted Windows system files.",
   items:["sfc /scannow","DISM /Online /Cleanup-Image /CheckHealth","DISM /Online /Cleanup-Image /RestoreHealth","Restart the computer"],
   correct:[1,2,0,3],
   domain:"Core 2 — OS Repair"},
  {id:"o3",title:"Laser Printer Imaging Process",
   instructions:"Drag the laser printer steps into the CORRECT order, from raw data to finished page.",
   items:["Fuse","Charge","Transfer","Raster","Develop","Expose","Clean"],
   correct:[3,1,5,4,2,0,6],
   domain:"Core 1 — Hardware/Printers"},
  {id:"o4",title:"Windows Boot Repair (bootrec)",
   instructions:"A workstation will not boot due to a corrupted boot record. Drag the bootrec commands into the order a technician should run them.",
   items:["bootrec /rebuildbcd","bootrec /fixboot","bootrec /scanos","bootrec /fixmbr"],
   correct:[3,1,2,0],
   domain:"Core 2 — Boot Recovery"},
  {id:"o5",title:"Malware Removal — Official 10-Step Process",
   instructions:"Drag the malware remediation steps into the correct order per the official CompTIA process.",
   items:["Schedule scans and run updates","Reimage/reinstall the OS if necessary","Quarantine the infected system","Investigate and verify malware symptoms","Disable System Restore","Update anti-malware software","Educate the end user","Enable System Restore and create a restore point","Remediate infected systems","Scan and removal techniques (Safe Mode, preinstallation environment)"],
   correct:[3,2,4,8,5,9,1,0,7,6],
   domain:"Core 2 — Security/Malware"},
  {id:"o6",title:"Change Management Process",
   instructions:"Drag the steps of a proper IT change management process into order.",
   items:["Implement the change","Document the change","Test in non-production","Request the change","Get approval","Assess risk and impact"],
   correct:[3,5,4,2,0,1],
   domain:"Core 2 — Operational Procedures"},
  {id:"o7",title:"RAID Performance — Slowest to Fastest Write Speed",
   instructions:"Drag these RAID levels into order from SLOWEST write performance to FASTEST write performance.",
   items:["RAID 0 (Striping)","RAID 6 (Double Parity)","RAID 1 (Mirroring)","RAID 5 (Parity)"],
   correct:[1,3,2,0],
   domain:"Core 1 — Hardware/RAID"},
  {id:"o8",title:"OSI Model — Bottom to Top",
   instructions:"Drag the OSI layers into the correct order, starting from Layer 1 (bottom) to Layer 7 (top).",
   items:["Network","Physical","Transport","Application","Data Link","Presentation","Session"],
   correct:[1,4,0,2,6,5,3],
   domain:"Core 1 — Networking"},
];

const PBQ_MATCHING=[
  {id:"m1",title:"Match Each Port to Its Service",
   instructions:"Drag each port number to match it with the correct service.",
   leftLabel:"Port",rightLabel:"Service",
   pairs:[["22","SSH / SFTP"],["25","SMTP"],["53","DNS"],["443","HTTPS"],["3389","RDP"],["110","POP3"]],
   domain:"Core 1 — Networking/Ports"},
  {id:"m2",title:"Match Each Malware Type to Its Description",
   instructions:"Drag each malware type to match its correct description.",
   leftLabel:"Malware",rightLabel:"Description",
   pairs:[["Ransomware","Encrypts files and demands payment"],["Rootkit","Hides itself from the OS at kernel level"],["Worm","Self-replicates across network without a host file"],["Trojan","Disguised as legitimate software, creates backdoor"],["Keylogger","Records every keystroke typed by the user"]],
   domain:"Core 2 — Security"},
  {id:"m3",title:"Match Each RAID Level to Its Minimum Drive Count",
   instructions:"Drag each RAID level to match its correct minimum number of required drives.",
   leftLabel:"RAID Level",rightLabel:"Min Drives",
   pairs:[["RAID 0","2 drives"],["RAID 1","2 drives"],["RAID 5","3 drives"],["RAID 6","4 drives"],["RAID 10","4 drives"]],
   domain:"Core 1 — Hardware"},
  {id:"m4",title:"Match Each Cable Type to Its Connector",
   instructions:"Drag each cable type to match the connector it normally uses.",
   leftLabel:"Cable Type",rightLabel:"Connector",
   pairs:[["UTP/STP","RJ45"],["Single-Mode Fiber","LC or SC"],["Coaxial (Cable TV)","F-Type"],["Coaxial (Legacy CCTV)","BNC"],["Telephone","RJ11"]],
   domain:"Core 1 — Hardware/Cables"},
  {id:"m5",title:"Match Each Windows Tool to Its Purpose",
   instructions:"Drag each MSC tool/command to match what it's used for.",
   leftLabel:"Tool",rightLabel:"Purpose",
   pairs:[["devmgmt.msc","View and manage hardware drivers"],["diskmgmt.msc","Manage partitions and volumes"],["eventvwr.msc","Review system and application logs"],["services.msc","Start/stop Windows services"],["gpedit.msc","Configure local Group Policy (Pro+)"]],
   domain:"Core 2 — OS/Windows Tools"},
  {id:"m6",title:"Match Each VPN Protocol to Its Security Status",
   instructions:"Drag each VPN protocol to match its security characteristic.",
   leftLabel:"Protocol",rightLabel:"Security Note",
   pairs:[["L2TP (alone)","No built-in encryption — needs IPsec"],["PPTP","Broken encryption — avoid entirely"],["IPsec","Strong Layer 3 encryption"],["WireGuard","Modern, fast, small codebase"],["OpenVPN","SSL/TLS based, very secure"]],
   domain:"Core 2 — Security/VPN"},
  {id:"m7",title:"Match Each Symptom to the Likely Cause",
   instructions:"Drag each symptom to match its most likely root cause.",
   leftLabel:"Symptom",rightLabel:"Likely Cause",
   pairs:[["IP address 169.254.x.x","DHCP server unreachable"],["Can ping IP but not domain name","DNS resolution failure"],["Random BSOD crashes","Failing RAM or driver issue"],["Computer overheats and shuts down","Dust buildup or dead fan"],["Print jobs stuck in queue","Print Spooler service stopped"]],
   domain:"Core 1/2 — Troubleshooting"},
  {id:"m8",title:"Match Each File System to Its Primary OS",
   instructions:"Drag each file system to match the operating system it's native to.",
   leftLabel:"File System",rightLabel:"Native OS",
   pairs:[["NTFS","Windows"],["ext4","Linux"],["APFS","macOS / iOS"],["ReFS","Windows Server"],["exFAT","Cross-platform (USB/SD)"]],
   domain:"Core 2 — OS/File Systems"},
];

// ─── TABS ─────────────────────────────────────────────────────────────────────
const MAIN_TABS=[
  {id:"overview",  label:"📋 Overview",exam:"both"},
  {id:"lessons",   label:"📚 Lessons",exam:"both"},
  {id:"glossary",  label:"📖 Glossary",exam:"both"},
  {id:"mobile",    label:"📱 Mobile Devices",exam:"core1"},
  {id:"ports",     label:"🌐 Ports",exam:"core1"},
  {id:"hardware",  label:"🔌 Hardware",exam:"core1"},
  {id:"commands",  label:"💻 Commands",exam:"core2"},
  {id:"subnetting",label:"📡 Subnetting",exam:"core1"},
  {id:"security",  label:"🔒 Security",exam:"core2"},
  {id:"os",        label:"🪟 OS & Software",exam:"core2"},
  {id:"ops",       label:"⚙️ Ops & Prof.",exam:"core2"},
  {id:"flashcards",label:"🃏 Flashcards",exam:"both"},
  {id:"exam",      label:"🧪 Exam Sim",exam:"both"},
  {id:"pbq",       label:"🧩 PBQ Sim",exam:"both"},
];
const EXAM_BADGE_COLOR={core1:T.accent,core2:T.purple,both:T.green};
const EXAM_BADGE_LABEL={core1:"CORE 1",core2:"CORE 2",both:"BOTH"};

// ─── TAB COMPONENTS ───────────────────────────────────────────────────────────

function OverviewTab(){
  if(!EXAM_INFO||!EXAM_INFO.core1||!EXAM_INFO.core2){
    return <div style={{textAlign:"center",padding:40,color:T.muted}}>Overview content is unavailable right now. Try refreshing the page.</div>;
  }
  return(
    <div style={{display:"grid",gap:12}}>
      {/* Exam Info Banner */}
      <div style={{background:"linear-gradient(135deg,#0f2035,#132845)",border:`1px solid ${T.border}`,borderRadius:10,padding:16}}>
        <div style={{color:T.accent,fontWeight:800,fontSize:18,marginBottom:4}}>CompTIA A+ Certification</div>
        <div style={{color:T.muted,fontSize:12,marginBottom:14}}>Two exams required • Released March 25, 2025 • Retires ~2028 (3 years after launch)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[EXAM_INFO.core1,EXAM_INFO.core2].map(e=>(
            <div key={e.code} style={{background:T.card,borderRadius:8,padding:12,border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <span style={{color:T.text,fontWeight:700,fontSize:14}}>{e.code} — {e.name}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{color:T.yellow,fontFamily:"monospace",fontWeight:800,fontSize:18,lineHeight:1}}>{e.pass}<span style={{color:T.muted,fontSize:11,fontWeight:400}}>/{e.scale}</span></div>
                  <div style={{color:T.muted,fontSize:9,marginTop:1}}>REQUIRED TO PASS</div>
                </div>
              </div>
              <div style={{color:T.muted,fontSize:11,marginBottom:2}}>Max {e.questions} questions · {e.time} minutes</div>
              <div style={{color:T.muted,fontSize:11}}>{e.topics}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Domain Weights */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[[EXAM_INFO.domains1,"Core 1 — 220-1201",T.accent],[EXAM_INFO.domains2,"Core 2 — 220-1202",T.purple]].map(([domains,title,color])=>(
          <div key={title} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:14}}>
            <div style={{color,fontWeight:700,fontSize:13,marginBottom:10}}>{title}</div>
            {domains.map(([name,pct])=>(
              <div key={name} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:T.text}}>{name}</span>
                  <span style={{color,fontWeight:700}}>{pct}</span>
                </div>
                <div style={{background:T.dim,borderRadius:3,height:5}}>
                  <div style={{background:color,borderRadius:3,height:5,width:pct,transition:"width 0.5s"}}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Key Exam Facts */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:14}}>
        <Sec title="Critical Exam Facts" color={T.yellow}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8}}>
            {[
              ["Core 1 pass score","675 / 900 (scaled)",T.green],
              ["Core 2 pass score","700 / 900 (scaled)",T.green],
              ["Questions per exam","Max 90 (MC + drag-drop + PBQ)",T.yellow],
              ["Time per exam","90 minutes",T.yellow],
              ["Question types","Multiple choice, drag-and-drop, PBQ (performance-based)",T.accent],
              ["PBQ tip","PBQs appear first — flag and return if needed. Worth more points.",T.red],
              ["Cost","$274 per exam (~$548 combined)",T.muted],
              ["Certification","Pass BOTH to earn A+ — version doesn't appear on cert",T.accent],
              ["Valid for","3 years (renew via CEUs or recertification exam)",T.muted],
              ["DoD 8140","Approved for DoD roles: tech support, sysadmin, cyber defense",T.purple],
            ].map(([l,v,c])=>(
              <div key={l} style={{padding:"8px 10px",background:T.surf,borderRadius:6,border:`1px solid ${T.border}`}}>
                <div style={{color:T.muted,fontSize:10,marginBottom:2}}>{l}</div>
                <div style={{color:c,fontSize:12,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
      {/* Study Plan */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:14}}>
        <Sec title="Recommended Study Order" color={T.cyan}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {[
              ["1","Start Here","Overview tab — understand exam structure and domain weights"],
              ["2","Hardware","Cables, connectors, devices, components — Core 1 foundation"],
              ["3","Networking","Ports, subnetting, wireless — largest Core 1 topic"],
              ["4","Commands","Windows + Linux commands with OS labels — both exams"],
              ["5","Security","Malware, encryption, VPNs — heavy on Core 2"],
              ["6","OS & Software","Windows editions, file systems, troubleshooting"],
              ["7","Ops & Prof.","Backup types, safety, professionalism — Core 2 domain"],
              ["8","Flashcards","Daily review of all 103 cards with hints"],
              ["9","Exam Sim","30 PBQ-style scenario questions with explanations"],
              ["10","Repeat","Focus on weak areas. Aim for 85%+ on Exam Sim before testing"],
            ].map(([num,step,desc])=>(
              <div key={num} style={{padding:"8px 10px",background:T.surf,borderRadius:6,border:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{background:T.accent,color:T.bg,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{num}</span>
                <div>
                  <div style={{color:T.cyan,fontWeight:700,fontSize:11}}>{step}</div>
                  <div style={{color:T.muted,fontSize:10,marginTop:2}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
}

function LessonsTab(){
  const [openId,setOpenId]=useState(LESSONS&&LESSONS.length>0?LESSONS[0].id:null);
  const [completed,setCompleted]=useState(()=>{
    try{return new Set(JSON.parse(localStorage.getItem("aplus_lessons_done")||"[]"));}catch(e){return new Set();}
  });
  const [revealed,setRevealed]=useState({}); // {lessonId-checkIdx: bool}
  const groups=LESSONS?[...new Set(LESSONS.map(l=>l.group))]:[];
  const lesson=LESSONS?LESSONS.find(l=>l.id===openId):null;
  const idx=LESSONS?LESSONS.findIndex(l=>l.id===openId):-1;

  const markDone=(id)=>{
    setCompleted(prev=>{
      const next=new Set(prev);next.add(id);
      try{localStorage.setItem("aplus_lessons_done",JSON.stringify([...next]));}catch(e){}
      return next;
    });
  };
  const toggleReveal=(key)=>setRevealed(prev=>({...prev,[key]:!prev[key]}));
  const goToLesson=(id)=>{
    setOpenId(id);setRevealed({});
    if(typeof window!=="undefined"&&window.scrollTo){window.scrollTo({top:0,behavior:"smooth"});}
  };

  if(!LESSONS||LESSONS.length===0){
    return <div style={{textAlign:"center",padding:40,color:T.muted}}>Lessons content is unavailable right now. Try refreshing the page.</div>;
  }

  const donePct=Math.round((completed.size/LESSONS.length)*100);

  return(
    <div>
      {/* Progress header */}
      <div style={{padding:12,background:T.accentDim,border:`1px solid ${T.accent}40`,borderRadius:9,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{color:T.accent,fontWeight:700,fontSize:13}}>📚 Learning Path — taught like a class, not a dictionary</div>
          <span style={{color:T.muted,fontSize:11}}>{completed.size}/{LESSONS.length} done</span>
        </div>
        <div style={{background:T.dim,borderRadius:3,height:5,marginBottom:6}}>
          <div style={{background:T.accent,borderRadius:3,height:5,width:`${donePct}%`,transition:"width 0.4s"}}/>
        </div>
        <div style={{color:T.muted,fontSize:11,lineHeight:1.5}}>
          Each lesson builds the concept from zero: a hook, a few teaching sections, a worked real-world scenario, common mistakes, a recap, and a self-check. Finish the self-check and mark it done to track your progress.
        </div>
      </div>

      {/* Lesson picker, grouped */}
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:16}}>
        {groups.map(g=>(
          <div key={g}>
            <div style={{color:T.purple,fontFamily:"monospace",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{g}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {LESSONS.filter(l=>l.group===g).map(l=>{
                const isOpen=l.id===openId;
                const isDone=completed.has(l.id);
                return(
                  <button key={l.id} onClick={()=>goToLesson(l.id)} style={{padding:"6px 12px",borderRadius:7,border:`1.5px solid ${isOpen?T.accent:isDone?T.green+"60":T.border}`,background:isOpen?T.accentDim:isDone?T.greenDim:T.card,color:isOpen?T.accent:isDone?T.green:T.text,cursor:"pointer",fontSize:11.5,fontWeight:isOpen?700:500,display:"flex",alignItems:"center",gap:5}}>
                    {isDone&&<span style={{fontSize:10}}>✓</span>}
                    {l.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lesson detail — the "class" itself */}
      {lesson&&(
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,gap:10}}>
            <div>
              <div style={{color:T.purple,fontFamily:"monospace",fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{lesson.group} · Lesson {idx+1} of {LESSONS.length}</div>
              <div style={{color:T.text,fontWeight:800,fontSize:19}}>{lesson.title}</div>
            </div>
            <span style={{background:T.surf,color:T.muted,padding:"3px 9px",borderRadius:6,fontSize:11,flexShrink:0}}>⏱ {lesson.time}</span>
          </div>

          {/* Hook */}
          <div style={{marginTop:12,padding:"12px 14px",background:T.purpleDim,border:`1px solid ${T.purple}30`,borderRadius:8}}>
            <div style={{color:T.purple,fontSize:11,fontWeight:700,marginBottom:4,letterSpacing:0.5}}>WHY THIS MATTERS</div>
            <div style={{color:T.text,fontSize:13,lineHeight:1.65,fontStyle:"italic"}}>{lesson.hook}</div>
          </div>

          {/* Teaching sections */}
          <div style={{marginTop:16}}>
            {lesson.sections.map((s,i)=>(
              <div key={i} style={{marginBottom:14}}>
                <div style={{color:T.accent,fontWeight:700,fontSize:13.5,marginBottom:5,display:"flex",gap:8,alignItems:"baseline"}}>
                  <span style={{color:T.muted,fontFamily:"monospace",fontSize:11}}>{i+1}</span>
                  {s.heading}
                </div>
                <div style={{color:T.text,fontSize:13,lineHeight:1.7,paddingLeft:18}}>{s.body}</div>
              </div>
            ))}
          </div>

          {/* Worked scenario */}
          {lesson.scenario&&(
            <div style={{marginTop:6,marginBottom:14,padding:14,background:T.surf,borderRadius:9,border:`1px solid ${T.border}`}}>
              <div style={{color:T.cyan,fontWeight:700,fontSize:12,marginBottom:8,letterSpacing:0.5}}>🎯 WORKED SCENARIO</div>
              <div style={{marginBottom:8}}>
                <div style={{color:T.muted,fontSize:10.5,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Setup</div>
                <div style={{color:T.text,fontSize:12.5,lineHeight:1.6}}>{lesson.scenario.setup}</div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{color:T.muted,fontSize:10.5,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>What happens</div>
                <div style={{color:T.text,fontSize:12.5,lineHeight:1.6}}>{lesson.scenario.walkthrough}</div>
              </div>
              <div>
                <div style={{color:T.green,fontSize:10.5,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Resolution</div>
                <div style={{color:T.text,fontSize:12.5,lineHeight:1.6}}>{lesson.scenario.resolution}</div>
              </div>
            </div>
          )}

          {/* Common mistakes */}
          {lesson.mistakes&&(
            <div style={{marginBottom:14,padding:14,background:T.redDim,borderRadius:9,border:`1px solid ${T.red}30`}}>
              <div style={{color:T.red,fontWeight:700,fontSize:12,marginBottom:8,letterSpacing:0.5}}>⚠️ MISTAKES PEOPLE ACTUALLY MAKE HERE</div>
              {lesson.mistakes.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:12.5,lineHeight:1.5}}>
                  <span style={{color:T.red,flexShrink:0}}>✗</span>
                  <span style={{color:T.text}}>{m}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recap */}
          {lesson.recap&&(
            <div style={{marginBottom:14,padding:14,background:T.greenDim,borderRadius:9,border:`1px solid ${T.green}30`}}>
              <div style={{color:T.green,fontWeight:700,fontSize:12,marginBottom:8,letterSpacing:0.5}}>✅ RECAP — LOCK THESE IN</div>
              {lesson.recap.map((r,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:12.5,lineHeight:1.5}}>
                  <span style={{color:T.green,flexShrink:0}}>•</span>
                  <span style={{color:T.text}}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Self-check */}
          {lesson.checkYourself&&(
            <div style={{marginBottom:6}}>
              <div style={{color:T.yellow,fontWeight:700,fontSize:12,marginBottom:8,letterSpacing:0.5}}>🧠 CHECK YOURSELF — tap to reveal</div>
              {lesson.checkYourself.map((c,i)=>{
                const key=`${lesson.id}-${i}`;
                const isRevealed=revealed[key];
                return(
                  <div key={i} onClick={()=>toggleReveal(key)} style={{padding:"10px 12px",background:T.surf,border:`1px solid ${isRevealed?T.yellow+"50":T.border}`,borderRadius:8,marginBottom:7,cursor:"pointer"}}>
                    <div style={{color:T.text,fontSize:12.5,fontWeight:600,marginBottom:isRevealed?6:0}}>Q: {c.q}</div>
                    {isRevealed?(
                      <div style={{color:T.yellow,fontSize:12,lineHeight:1.55,paddingTop:6,borderTop:`1px solid ${T.border}`}}>{c.a}</div>
                    ):(
                      <div style={{color:T.dim,fontSize:11,marginTop:4}}>Tap to reveal answer</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer nav */}
          <div style={{display:"flex",gap:10,marginTop:16,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
            <button onClick={()=>idx>0&&goToLesson(LESSONS[idx-1].id)} disabled={idx===0} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:idx===0?T.dim:T.muted,cursor:idx===0?"default":"pointer",fontSize:12.5}}>← Previous</button>
            <button onClick={()=>markDone(lesson.id)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${completed.has(lesson.id)?T.green:T.accent}`,background:completed.has(lesson.id)?T.greenDim:T.accentDim,color:completed.has(lesson.id)?T.green:T.accent,cursor:"pointer",fontWeight:700,fontSize:12.5}}>{completed.has(lesson.id)?"✓ Completed":"Mark Complete"}</button>
            <button onClick={()=>idx<LESSONS.length-1&&goToLesson(LESSONS[idx+1].id)} disabled={idx===LESSONS.length-1} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${T.accent}50`,background:T.accentDim,color:idx===LESSONS.length-1?T.dim:T.accent,cursor:idx===LESSONS.length-1?"default":"pointer",fontWeight:600,fontSize:12.5}}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function GlossaryTab(){
  const [search,setSearch]=useState("");
  if(!GLOSSARY||Object.keys(GLOSSARY).length===0){
    return <div style={{textAlign:"center",padding:40,color:T.muted}}>Glossary content is unavailable right now. Try refreshing the page.</div>;
  }
  const terms=Object.entries(GLOSSARY)
    .filter(([k,v])=>search===""||k.toLowerCase().includes(search.toLowerCase())||v.full.toLowerCase().includes(search.toLowerCase())||v.def.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>a[0].localeCompare(b[0]));
  const byLetter={};
  terms.forEach(([k,v])=>{
    const letter=k[0].toUpperCase();
    if(!byLetter[letter])byLetter[letter]=[];
    byLetter[letter].push([k,v]);
  });
  const letters=Object.keys(byLetter).sort();
  return(
    <div>
      <div style={{marginBottom:14}}>
        <Search value={search} onChange={setSearch} placeholder="Search terms, abbreviations, definitions…"/>
        <span style={{color:T.muted,fontSize:11,marginLeft:10}}>{terms.length} terms</span>
      </div>
      {letters.length===0&&<div style={{color:T.muted,textAlign:"center",padding:30}}>No terms match "{search}"</div>}
      {letters.map(letter=>(
        <div key={letter} style={{marginBottom:14}}>
          <div style={{color:T.accent,fontFamily:"monospace",fontSize:13,fontWeight:700,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${T.border}`}}>{letter}</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {byLetter[letter].map(([k,v])=>(
              <div key={k} style={{padding:"8px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:7}}>
                <div style={{display:"flex",gap:8,alignItems:"baseline",flexWrap:"wrap"}}>
                  <span style={{color:T.text,fontWeight:800,fontSize:13.5}}>{k}</span>
                  <span style={{color:T.muted,fontSize:11,fontStyle:"italic"}}>{v.full}</span>
                </div>
                <div style={{color:T.muted,fontSize:12,marginTop:2,lineHeight:1.5}}>{v.def}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileTab(){
  const [sub,setSub]=useState("hardware");
  const subTabs=[
    {id:"hardware",label:"🔧 HW Replacement"},
    {id:"accessories",label:"🔌 Accessories"},
    {id:"connectivity",label:"📶 Connectivity"},
    {id:"troubleshoot",label:"🩺 Troubleshooting"},
  ];
  return(
    <div>
      <DomainBanner exam="core1" domain="Mobile Devices domain 1.0 (13% of Core 1)" note="hardware replacement, accessories/connectivity, network configuration"/>
      <Tabs tabs={subTabs} active={sub} setActive={setSub} color={T.yellow}/>

      {sub==="hardware"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:"9px 12px",background:T.surf,borderRadius:8,marginBottom:2,fontSize:11.5,color:T.muted}}>
            Objective 1.1 — parts a technician commonly monitors and replaces on laptops/mobile devices.
          </div>
          {MOBILE_HW_REPLACEMENT.map(m=>(
            <div key={m.part} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.yellow}`}}>
              <div style={{color:T.yellow,fontWeight:700,fontSize:13,marginBottom:3}}>{m.part}</div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.55}}>{m.desc}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:4}}>
            <Sec title="Physical Privacy & Security Components" color={T.purple}>
              {MOBILE_PRIVACY_SECURITY.map(m=>(
                <div key={m.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{m.name}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{m.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}

      {sub==="accessories"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:"9px 12px",background:T.surf,borderRadius:8,marginBottom:2,fontSize:11.5,color:T.muted}}>
            Objective 1.2 — accessories and connectivity options for mobile devices.
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Connection Methods" color={T.cyan}>
              {MOBILE_CONNECTION_METHODS.map(m=>(
                <div key={m.method} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.cyan,fontWeight:700,fontSize:12.5,marginBottom:2}}>{m.method}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{m.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Accessories" color={T.orange}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                {MOBILE_ACCESSORIES.map(m=>(
                  <div key={m.name} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{color:T.orange,fontWeight:700,fontSize:12}}>{m.name}</div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45,marginTop:2}}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
        </div>
      )}

      {sub==="connectivity"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:"9px 12px",background:T.surf,borderRadius:8,marginBottom:2,fontSize:11.5,color:T.muted}}>
            Objective 1.3 — configuring basic mobile network connectivity and application support.
          </div>
          {MOBILE_NETWORK_CONFIG.map(m=>(
            <div key={m.feature} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.green}`}}>
              <div style={{color:T.green,fontWeight:700,fontSize:13,marginBottom:3}}>{m.feature}</div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.55}}>{m.desc}</div>
            </div>
          ))}
          <div style={{padding:12,background:T.yellowDim,border:`1px solid ${T.yellow}40`,borderRadius:8}}>
            <div style={{color:T.yellow,fontWeight:700,fontSize:12,marginBottom:4}}>💡 Bluetooth pairing — exact sequence tested</div>
            <div style={{color:T.muted,fontSize:11.5,lineHeight:1.6}}>Enable Bluetooth → Enable pairing (make discoverable) → Find the device to pair → Enter the PIN code → Test connectivity. This exact order is a common PBQ-style ordering question.</div>
          </div>
        </div>
      )}

      {sub==="troubleshoot"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{padding:"9px 12px",background:T.surf,borderRadius:8,marginBottom:2,fontSize:11.5,color:T.muted}}>
            Objective 5.4 (Core 1) — common mobile device troubleshooting symptoms.
          </div>
          {[
            {symptom:"Poor battery health / swollen battery",fix:"Swollen battery = stop using immediately, handle carefully, dispose at a battery recycling center. Poor health = replace battery."},
            {symptom:"Broken screen",fix:"Replace the screen/digitizer assembly. Back up data first if the device still powers on."},
            {symptom:"Improper charging",fix:"Check charging port for debris, try a different cable/adapter, inspect for physical port damage."},
            {symptom:"Poor/no connectivity",fix:"Toggle airplane mode, check for carrier outages, verify SIM seating, check for a damaged antenna."},
            {symptom:"Liquid damage",fix:"Power off immediately, do not charge, remove SIM/battery if possible, let fully dry, professional cleaning may be needed."},
            {symptom:"Overheating",fix:"Close background apps, remove case while charging, check for a failing battery or blocked vents."},
            {symptom:"Digitizer issues",fix:"Digitizer (touch layer) can fail separately from the display — screen looks fine but touch doesn't register correctly. Usually needs replacement."},
            {symptom:"Physically damaged ports",fix:"Inspect for bent pins or debris; a damaged charging port often needs professional micro-soldering repair."},
            {symptom:"Malware (mobile)",fix:"Uninstall suspicious apps, run mobile antivirus, factory reset if severe, restore only from a clean backup."},
            {symptom:"Cursor drift/touch calibration",fix:"Recalibrate the touchscreen in settings; persistent drift often indicates a failing digitizer."},
            {symptom:"Unable to install new applications",fix:"Check available storage, verify OS version compatibility, check app store account status."},
            {symptom:"Stylus does not work",fix:"Check stylus battery (active styluses), confirm Bluetooth pairing if wireless, verify device support for that specific stylus."},
            {symptom:"Degraded performance",fix:"Check storage space, background app usage, and battery health — all three commonly degrade performance as a device ages."},
          ].map(t=>(
            <div key={t.symptom} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.red}`}}>
              <div style={{color:T.red,fontWeight:700,fontSize:12.5,marginBottom:3}}>{t.symptom}</div>
              <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}><span style={{color:T.green}}>Fix: </span>{t.fix}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortsTab(){
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [showLegacy,setShowLegacy]=useState(true);
  const tiers=["all","critical","high","medium","low"];
  const shown=PORTS.filter(p=>
    (filter==="all"||p.tier===filter)&&
    (showLegacy||!p.legacy)&&
    (search===""||String(p.port).includes(search)||p.svc.toLowerCase().includes(search.toLowerCase())||p.desc.toLowerCase().includes(search.toLowerCase()))
  );
  const protoColor=proto=>{if(proto.includes("TCP")&&proto.includes("UDP"))return T.purple;if(proto==="UDP")return T.green;return T.accent;};
  return(
    <div>
      <DomainBanner exam="core1" domain="Networking domain, objective 2.1" note="TCP/UDP ports and protocols"/>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        {tiers.map(t=><button key={t} onClick={()=>setFilter(t)} style={{padding:"4px 11px",borderRadius:5,border:`1px solid ${filter===t?T.accent:T.border}`,background:filter===t?T.accentDim:"transparent",color:filter===t?T.accent:T.muted,cursor:"pointer",fontSize:11,fontWeight:600,textTransform:"uppercase"}}>{t}</button>)}
        <Search value={search} onChange={setSearch} placeholder="Port # or service…"/>
        <button onClick={()=>setShowLegacy(v=>!v)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${showLegacy?T.orange:T.border}`,background:showLegacy?T.orangeDim:"transparent",color:showLegacy?T.orange:T.muted,cursor:"pointer",fontSize:11}}>
          {showLegacy?"Hide":"Show"} Legacy
        </button>
        <span style={{color:T.muted,fontSize:11}}>{shown.length} ports</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {shown.map(p=>(
          <div key={p.port} style={{padding:"9px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${tierClr(p.tier)}`}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
              <span style={{color:T.accent,fontFamily:"monospace",fontWeight:800,fontSize:17,minWidth:40}}>{p.port}</span>
              <span style={{color:protoColor(p.proto),fontSize:11,fontWeight:700,minWidth:68}}>{p.proto}</span>
              <span style={{color:T.text,fontWeight:700,fontSize:13,flex:1}}>{p.svc}</span>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {p.legacy&&<LegacyTag/>}
                <Tag tier={p.tier}/>
              </div>
            </div>
            <div style={{color:T.muted,fontSize:11,lineHeight:1.5,marginLeft:48}}>
              {p.desc}
              {p.alt&&p.alt!=="—"&&<span style={{color:T.dim,marginLeft:8,fontSize:10}}>See also: {p.alt}</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Memory tricks */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10,marginTop:14}}>
        <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:8}}>
          <div style={{color:T.yellow,fontWeight:700,marginBottom:6}}>"8-4-4" — Web/Secure/Remote</div>
          {[["80","HTTP — Web (not secure)"],["443","HTTPS — Web (TLS encrypted)"],["22","SSH — Secure remote access"]].map(([p,d])=>
            <div key={p} style={{display:"flex",gap:8,fontSize:12,padding:"2px 0"}}><span style={{color:T.accent,fontFamily:"monospace",minWidth:34}}>{p}</span><span style={{color:T.text}}>{d}</span></div>
          )}
        </div>
        <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:8}}>
          <div style={{color:T.orange,fontWeight:700,marginBottom:6}}>"2-5-3" — Files/Mail/Names</div>
          {[["21","FTP — File Transfer Control"],["25","SMTP — Mail Out (server)"],["53","DNS — Name Resolution"]].map(([p,d])=>
            <div key={p} style={{display:"flex",gap:8,fontSize:12,padding:"2px 0"}}><span style={{color:T.accent,fontFamily:"monospace",minWidth:34}}>{p}</span><span style={{color:T.text}}>{d}</span></div>
          )}
        </div>
        <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:8}}>
          <div style={{color:T.green,fontWeight:700,marginBottom:6}}>Secure Port Pairs</div>
          {[["110","POP3","995","POP3S"],["143","IMAP","993","IMAPS"],["389","LDAP","636","LDAPS"],["25","SMTP","587","SMTP Submit"]].map(([p1,n1,p2,n2])=>
            <div key={p1} style={{display:"flex",gap:6,fontSize:11,padding:"2px 0",alignItems:"center"}}>
              <span style={{color:T.muted,minWidth:28}}>{p1}</span><span style={{color:T.muted,fontSize:10}}>{n1}</span>
              <span style={{color:T.dim}}>→</span>
              <span style={{color:T.green,minWidth:28}}>{p2}</span><span style={{color:T.green,fontSize:10}}>{n2}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{marginTop:14,padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="Remote Terminal Access Servers — Telnet, SSH & RDP as One Category" color={T.purple}>
          <div style={{color:T.muted,fontSize:11.5,marginBottom:10,lineHeight:1.5}}>All three let you control a remote host, but split into two types: text-based (CLI) and graphical (GUI).</div>
          {REMOTE_ACCESS.map(r=>(
            <div key={r.name} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`,flexWrap:"wrap"}}>
              <span style={{color:r.secure?T.green:T.red,fontWeight:800,fontSize:14,minWidth:60}}>{r.name}</span>
              <span style={{color:T.accent,fontFamily:"monospace",fontSize:12,minWidth:36}}>{r.port}</span>
              <Pill color={r.type.includes("GUI")?T.cyan:T.yellow}>{r.type}</Pill>
              <span style={{color:r.secure?T.green:T.red,fontSize:10.5,fontWeight:700}}>{r.secure?"✓ Encrypted":"✗ Plaintext"}</span>
              <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5,width:"100%",marginTop:2}}>{r.desc}</div>
            </div>
          ))}
        </Sec>
      </div>
    </div>
  );
}

function HardwareTab(){
  const [sub,setSub]=useState("cables");
  const subTabs=[
    {id:"cables",label:"🔌 Cables",group:"Cables & Connectors"},
    {id:"connectors",label:"🔧 Connectors",group:"Cables & Connectors"},
    {id:"video",label:"🖥️ Video & Peripheral",group:"Cables & Connectors"},
    {id:"pinouts",label:"🎨 Pinouts",group:"Cables & Connectors"},
    {id:"display",label:"📺 Display Tech",group:"Devices & Displays"},
    {id:"devices",label:"📡 Network Devices",group:"Devices & Displays"},
    {id:"wireless",label:"📶 Wireless",group:"Devices & Displays"},
    {id:"iot",label:"🏠 IoT",group:"Devices & Displays"},
    {id:"components",label:"💻 PC Components",group:"PC Internals"},
    {id:"raid",label:"💾 RAID",group:"PC Internals"},
    {id:"printers",label:"🖨️ Printer Types",group:"Printers"},
  ];
  return(
    <div>
      <DomainBanner exam="core1" domain="Hardware domain 3.0" note="IoT sub-tab technically belongs to Networking objective 2.3, grouped here for convenience"/>
      <GroupedTabs tabs={subTabs} active={sub} setActive={setSub} color={T.green}/>
      {sub==="cables"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {CABLES.map(c=>(
            <div key={c.name} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${c.color}`}}>
              <div style={{display:"flex",gap:12,alignItems:"baseline",marginBottom:6,flexWrap:"wrap"}}>
                <span style={{color:c.color,fontWeight:800,fontSize:15}}>{c.name}</span>
                <span style={{color:T.text,fontSize:12}}>{c.full}</span>
                <span style={{color:T.yellow,fontFamily:"monospace",fontWeight:700,fontSize:13}}>{c.maxLen}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"4px 12px",fontSize:11}}>
                <div><span style={{color:T.muted}}>Connector: </span><span style={{color:T.accent}}>{c.connector}</span></div>
                <div><span style={{color:T.muted}}>Pros: </span><span style={{color:T.green}}>{c.pros}</span></div>
                <div><span style={{color:T.muted}}>Cons: </span><span style={{color:T.red}}>{c.cons}</span></div>
                <div><span style={{color:T.muted}}>Uses: </span><span style={{color:T.text}}>{c.uses}</span></div>
              </div>
            </div>
          ))}
          <div style={{padding:12,background:T.surf,borderRadius:8,border:`1px solid ${T.border}`}}>
            <div style={{color:T.yellow,fontWeight:700,marginBottom:6,fontSize:13}}>Key Rules to Remember</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8,fontSize:11}}>
              {[["All copper Ethernet","100 meters MAX — Cat5e, Cat6, Cat6a all same limit",T.yellow],["Cat6 at 10 Gbps","Only 55 meters. Cat6a needed for full 100m at 10 Gbps",T.orange],["Fiber = light","Immune to EMI. No distance issues from electrical interference.",T.cyan],["SMF vs MMF","SMF: 9µm laser, km. MMF: 50/62.5µm LED, up to 550m",T.purple]].map(([t,d,c])=>
                <div key={t} style={{padding:8,background:T.card,borderRadius:6}}><div style={{color:c,fontWeight:700,marginBottom:2}}>{t}</div><div style={{color:T.muted}}>{d}</div></div>
              )}
            </div>
          </div>
        </div>
      )}
      {sub==="connectors"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
          {CONNECTORS.map(c=>(
            <div key={c.name} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderTop:`2px solid ${c.color}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span style={{color:c.color,fontWeight:800,fontSize:15}}>{c.name}</span>
                {c.legacy&&<LegacyTag/>}
              </div>
              <div style={{color:T.muted,fontSize:11,marginBottom:2}}>{c.pins}</div>
              <div style={{color:T.text,fontSize:12,marginBottom:4}}>{c.desc}</div>
              <div style={{color:T.muted,fontSize:11}}>Uses: {c.uses}</div>
            </div>
          ))}
        </div>
      )}
      {sub==="video"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Video Cables — Carry Display Signal" color={T.cyan}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
                {VIDEO_CABLES.map(v=>(
                  <div key={v.name} style={{padding:"10px 12px",background:T.surf,borderRadius:8,borderTop:`2px solid ${v.color}`}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                      <span style={{color:v.color,fontWeight:800,fontSize:13.5}}>{v.name}</span>
                      {v.legacy&&<LegacyTag/>}
                    </div>
                    <div style={{color:T.muted,fontSize:10.5,marginBottom:3}}>{v.full}</div>
                    <div style={{color:T.text,fontSize:11.5,lineHeight:1.5}}>{v.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Peripheral Cables — Carry Data/Power" color={T.green}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
                {PERIPHERAL_CABLES.map(p=>(
                  <div key={p.name} style={{padding:"10px 12px",background:T.surf,borderRadius:8,borderTop:`2px solid ${p.color}`}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                      <span style={{color:p.color,fontWeight:800,fontSize:13.5}}>{p.name}</span>
                      {p.legacy&&<LegacyTag/>}
                    </div>
                    <div style={{color:T.text,fontSize:11.5,lineHeight:1.5}}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Mobile Device Accessories" color={T.yellow}>
              {MOBILE_ACCESSORIES.map(m=>(
                <div key={m.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.yellow,fontWeight:700,fontSize:12.5,marginBottom:2}}>{m.name}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{m.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="display"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="LCD Panel Types & Display Technologies" color={T.purple}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
                {DISPLAY_TYPES.map(d=>(
                  <div key={d.name} style={{padding:"10px 12px",background:T.surf,borderRadius:8,borderTop:`2px solid ${d.color}`}}>
                    <div style={{color:d.color,fontWeight:800,fontSize:14,marginBottom:2}}>{d.name}</div>
                    <div style={{color:T.muted,fontSize:10.5,marginBottom:3}}>{d.full}</div>
                    <div style={{color:T.text,fontSize:11.5,lineHeight:1.5}}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Display Attributes — What They Mean" color={T.cyan}>
              {DISPLAY_ATTRIBUTES.map(a=>(
                <div key={a.attr} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                    <span style={{color:T.cyan,fontWeight:700,fontSize:12.5}}>{a.attr}</span>
                    {a.legacy&&<LegacyTag/>}
                  </div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{a.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="devices"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {NET_DEVICES.map(d=>(
            <div key={d.name} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${d.color}`}}>
              <div style={{display:"flex",gap:10,alignItems:"baseline",flexWrap:"wrap",marginBottom:5}}>
                <span style={{color:d.color,fontWeight:800,fontSize:15}}>{d.name}</span>
                <span style={{color:d.color,fontFamily:"monospace",fontWeight:800,fontSize:18}}>L{d.layer}</span>
                {d.legacy&&<LegacyTag/>}
                <span style={{background:T.accentDim,color:T.accent,padding:"1px 7px",borderRadius:4,fontSize:10}}>💡 {d.tip}</span>
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>{d.desc}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="PoE Standards" color={T.yellow}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[["802.3af","PoE","15.4W","Basic APs, phones, cameras"],["802.3at","PoE+","30W","Better APs, video cameras"],["802.3bt","PoE++","60–90W","PTZ cameras, laptop charging"]].map(([std,name,watts,use])=>
                  <div key={std} style={{padding:10,background:T.surf,borderRadius:7,textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{color:T.muted,fontSize:9}}>{std}</div>
                    <div style={{color:T.text,fontWeight:700,fontSize:13}}>{name}</div>
                    <div style={{color:T.yellow,fontSize:20,fontWeight:800,margin:"3px 0"}}>{watts}</div>
                    <div style={{color:T.muted,fontSize:10}}>{use}</div>
                  </div>
                )}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Server Roles — What Runs on the Network" color={T.cyan}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                {SERVER_ROLES.map(s=>(
                  <div key={s.role} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{color:T.cyan,fontWeight:700,fontSize:12}}>{s.role}</div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45,marginTop:2}}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Internet Appliances" color={T.orange}>
              {NETWORK_APPLIANCES.map(n=>(
                <div key={n.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.orange,fontWeight:700,fontSize:12.5,marginBottom:2}}>{n.name}{n.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({n.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{n.desc}</div>
                </div>
              ))}
            </Sec>
            <Sec title="Legacy & Embedded Systems" color={T.red}>
              {LEGACY_SYSTEMS.map(l=>(
                <div key={l.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.red,fontWeight:700,fontSize:12.5,marginBottom:2}}>{l.name}{l.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({l.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{l.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="More Networking Tools" color={T.purple}>
              {NETWORKING_TOOLS_EXTRA.map(n=>(
                <div key={n.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{n.name}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{n.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="components"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {HARDWARE_COMPONENTS.map(c=>(
            <div key={c.name} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${c.color}`}}>
              <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:5,flexWrap:"wrap"}}>
                <span style={{color:c.color,fontWeight:800,fontSize:15}}>{c.name}</span>
                <span style={{color:T.muted,fontSize:12}}>{c.full}</span>
                <span style={{color:T.yellow,fontFamily:"monospace",fontSize:12}}>{c.speed}</span>
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>{c.desc}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:4}}>
            <Sec title="Motherboard Connectors & Power" color={T.orange}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8}}>
                {MOBO_CONNECTORS.map(m=>(
                  <div key={m.name} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                      <span style={{color:T.orange,fontWeight:700,fontSize:12}}>{m.name}</span>
                      {m.legacy&&<LegacyTag/>}
                    </div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45}}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Expansion Slots" color={T.purple}>
              {EXPANSION_SLOTS.map(e=>(
                <div key={e.slot} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{e.slot}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{e.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="BIOS/UEFI Security Settings" color={T.red}>
              {BIOS_SECURITY_SETTINGS.map(b=>(
                <div key={b.setting} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.red,fontWeight:700,fontSize:12.5,marginBottom:2}}>{b.setting}{b.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({b.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{b.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="raid"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {RAID.map(r=>(
            <div key={r.level} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${r.fault?T.green:T.red}`}}>
              <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:6,flexWrap:"wrap"}}>
                <span style={{color:T.accent,fontWeight:800,fontSize:16}}>{r.level}</span>
                <span style={{color:T.text,fontSize:13}}>{r.name}</span>
                <span style={{color:T.muted,fontSize:11}}>Min: {r.min} drives</span>
                <span style={{background:r.fault?T.greenDim:T.redDim,color:r.fault?T.green:T.red,padding:"1px 7px",borderRadius:4,fontSize:10,fontWeight:700}}>{r.fault?"✓ Fault Tolerant":"✗ No Fault Tolerance"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"start"}}>
                <div>
                  <div style={{color:T.text,fontSize:12,lineHeight:1.5,marginBottom:4}}>{r.desc}</div>
                  <div style={{color:T.muted,fontSize:11}}>Best for: <span style={{color:T.yellow}}>{r.use}</span></div>
                </div>
                <div style={{textAlign:"center",padding:"6px 10px",background:T.surf,borderRadius:6}}>
                  <div style={{color:T.muted,fontSize:9}}>Capacity</div>
                  <div style={{color:T.text,fontWeight:700,fontSize:12}}>{r.cap}</div>
                </div>
                <div style={{textAlign:"center",padding:"6px 10px",background:T.surf,borderRadius:6}}>
                  <div style={{color:T.muted,fontSize:9}}>Performance</div>
                  <div style={{color:T.yellow,fontWeight:700,fontSize:12}}>{r.perf}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {sub==="wireless"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Wi-Fi Standards — Know BOTH the 802.11x AND Wi-Fi # names" color={T.yellow}>
              {WIRELESS.map(w=>(
                <div key={w.std} style={{display:"grid",gridTemplateColumns:"100px 80px 120px 90px 1fr",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"center",fontSize:12}}>
                  <span style={{color:T.accent,fontFamily:"monospace",fontWeight:700}}>{w.std}</span>
                  <span style={{color:T.yellow,fontWeight:700}}>{w.wifi}</span>
                  <span style={{color:T.text}}>{w.freq}</span>
                  <span style={{color:T.green}}>{w.speed}</span>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{color:T.muted,fontSize:11}}>{w.notes}</span>
                    {w.legacy&&<LegacyTag/>}
                  </div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Other Wireless Technologies (Not Wi-Fi)" color={T.purple}>
              {OTHER_WIRELESS_TECH.map(o=>(
                <div key={o.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:2,flexWrap:"wrap"}}>
                    <span style={{color:T.purple,fontWeight:700,fontSize:12.5}}>{o.name}</span>
                    {o.full&&<span style={{color:T.muted,fontSize:10.5}}>({o.full})</span>}
                    <span style={{color:T.yellow,fontSize:10.5,fontFamily:"monospace"}}>{o.range}</span>
                  </div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{o.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
              <Sec title="Security Protocols" color={T.green}>
                {[["WEP","Broken — never use",T.red,true],["WPA","TKIP — weak, deprecated",T.orange,true],["WPA2-Personal","AES-CCMP — shared password (PSK)",T.green,false],["WPA2-Enterprise","AES + RADIUS per-user auth",T.green,false],["WPA3","SAE/Dragonfly — strongest, forward secrecy",T.cyan,false]].map(([n,d,c,leg])=>(
                  <div key={n} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.border}`,alignItems:"flex-start"}}>
                    <div style={{minWidth:130}}>
                      <span style={{color:c,fontWeight:700,fontSize:12}}>{n}</span>
                      {leg&&<span style={{marginLeft:5}}><LegacyTag/></span>}
                    </div>
                    <span style={{color:T.muted,fontSize:11}}>{d}</span>
                  </div>
                ))}
              </Sec>
            </div>
            <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
              <Sec title="Exam Traps — Wireless" color={T.red}>
                {[["WPS","Always DISABLE — brute force in <11,000 tries"],["SSID hiding","NOT security — scanners detect hidden networks"],["MAC filtering","NOT security — MACs are easily spoofed"],["2.4 GHz channels","Use 1, 6, or 11 — non-overlapping"],["802.11ac","5 GHz ONLY — NOT dual-band"],["Evil Twin","Rogue AP — always verify certificate"],["Open Wi-Fi","No encryption — always VPN on public Wi-Fi"]].map(([t,d])=>(
                  <div key={t} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:11}}>
                    <span style={{color:T.red,fontWeight:700,minWidth:110}}>{t}</span>
                    <span style={{color:T.muted}}>{d}</span>
                  </div>
                ))}
              </Sec>
            </div>
          </div>
        </div>
      )}
      {sub==="pinouts"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {[
            {std:"T568A",note:"Less common. Same standard both ends = straight-through.",pins:["White/Green","Green","White/Orange","Blue","White/Blue","Orange","White/Brown","Brown"],colors:["#00c040","#00c040","#e86000","#0060d0","#0060d0","#e86000","#804000","#804000"]},
            {std:"T568B",note:"Most common in US. Preferred standard for new installs.",pins:["White/Orange","Orange","White/Green","Blue","White/Blue","Green","White/Brown","Brown"],colors:["#e86000","#e86000","#00c040","#0060d0","#0060d0","#00c040","#804000","#804000"]},
          ].map(({std,note,pins,colors})=>(
            <div key={std} style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
              <div style={{color:T.accent,fontWeight:800,fontSize:16,marginBottom:2}}>{std}</div>
              <div style={{color:T.muted,fontSize:11,marginBottom:10}}>{note}</div>
              {pins.map((pin,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:`1px solid ${T.border}`,alignItems:"center",fontSize:12}}>
                  <span style={{color:T.muted,fontFamily:"monospace",minWidth:16}}>{i+1}</span>
                  <span style={{display:"inline-block",width:13,height:13,borderRadius:2,background:colors[i],border:"1px solid rgba(255,255,255,0.15)",flexShrink:0}}/>
                  <span style={{color:T.text}}>{pin}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Cable Types" color={T.yellow}>
              {[["Straight-Through","Same standard both ends (A–A or B–B). PC to switch, switch to router.",T.green],["Crossover","Different standards (A–B). PC to PC, old switch to switch. Legacy — auto-MDI/MDI-X handles this now.",T.muted]].map(([t,d,c])=>(
                <div key={t} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:c,fontWeight:700,fontSize:13,marginBottom:2}}>{t}</div>
                  <div style={{color:T.muted,fontSize:11}}>{d}</div>
                  {t==="Crossover"&&<span style={{marginTop:4,display:"inline-block"}}><LegacyTag/></span>}
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="printers"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:12,background:T.accentDim,border:`1px solid ${T.accent}40`,borderRadius:8}}>
            <div style={{color:T.accent,fontWeight:700,fontSize:13,marginBottom:4}}>🖨️ Beyond Laser & Inkjet</div>
            <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>The full laser imaging process is covered on the OS & Software tab's Printers section. This covers the FULL set of printer types the exam tests, including two easy-to-forget ones.</div>
          </div>
          {PRINTER_TYPES.map(p=>(
            <div key={p.type} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${p.color}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                <span style={{color:p.color,fontWeight:800,fontSize:15}}>{p.type}</span>
                {p.legacy&&<LegacyTag/>}
              </div>
              <div style={{color:T.text,fontSize:12.5,marginBottom:4}}><span style={{color:T.muted}}>How it works: </span>{p.process}</div>
              <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}><span style={{color:T.yellow}}>Maintenance: </span>{p.maintenance}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:4}}>
            <Sec title="Printer Drivers / Languages" color={T.cyan}>
              {PRINTER_DRIVERS.map(d=>(
                <div key={d.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.cyan,fontWeight:700,fontSize:12.5,marginBottom:2}}>{d.name}{d.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({d.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{d.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Printer Configuration Options" color={T.yellow}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {PRINTER_CONFIG_OPTIONS.map(c=>(
                  <div key={c.setting} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{color:T.yellow,fontWeight:700,fontSize:12}}>{c.setting}</div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45,marginTop:2}}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Printer Security" color={T.red}>
              {PRINTER_SECURITY.map(s=>(
                <div key={s.feature} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.red,fontWeight:700,fontSize:12.5,marginBottom:2}}>{s.feature}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{s.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Network Scan Delivery" color={T.green}>
              {PRINTER_SCAN_DELIVERY.map(s=>(
                <div key={s.method} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.green,fontWeight:700,fontSize:12.5,marginBottom:2}}>{s.method}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{s.desc}</div>
                </div>
              ))}
            </Sec>
            <Sec title="Scanner Input Types" color={T.purple}>
              {PRINTER_INPUT_TYPES.map(i=>(
                <div key={i.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{i.name}{i.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({i.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{i.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="iot"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:12,background:T.accentDim,border:`1px solid ${T.accent}40`,borderRadius:8}}>
            <div style={{color:T.accent,fontWeight:700,fontSize:13,marginBottom:4}}>🏠 Internet of Things (IoT)</div>
            <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>Everyday physical devices connected to the internet so they can be monitored or controlled remotely. The exam focuses on how these devices are CONTROLLED and common SMART HOME examples, not deep technical protocols.</div>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Control Systems — How IoT Devices Are Managed" color={T.yellow}>
              {IOT_CONTROL.map(c=>(
                <div key={c.method} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.yellow,fontWeight:700,fontSize:12.5,marginBottom:2}}>{c.method}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{c.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Smart Home — Common Device Categories" color={T.cyan}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                {IOT_DEVICES.map(d=>(
                  <div key={d.device} style={{padding:10,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{color:T.cyan,fontWeight:700,fontSize:12,marginBottom:3}}>{d.device}</div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45}}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:12,background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:8}}>
            <div style={{color:T.red,fontWeight:700,fontSize:12,marginBottom:4}}>⚠️ Security consideration</div>
            <div style={{color:T.muted,fontSize:11.5,lineHeight:1.6}}>IoT devices are frequently exploited because they run outdated firmware and are rarely patched. Best practice: put IoT devices on a separate guest/IoT VLAN, isolated from sensitive network resources.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommandsTab(){
  const [cat,setCat]=useState("All");
  const [osF,setOsF]=useState("All");
  const [search,setSearch]=useState("");
  const cats=["All","Network","Repair","System","Admin","Files"];
  const oss=["All","win","linux","both","ps"];
  const shown=COMMANDS.filter(c=>
    (cat==="All"||c.cat===cat)&&
    (osF==="All"||c.os===osF)&&
    (search===""||c.cmd.toLowerCase().includes(search.toLowerCase())||c.desc.toLowerCase().includes(search.toLowerCase()))
  );
  return(
    <div>
      <div style={{padding:"9px 12px",background:T.purpleDim,border:`1px solid ${T.purple}40`,borderRadius:8,marginBottom:10}}>
        <span style={{color:T.purple,fontWeight:800,fontSize:10.5,letterSpacing:0.5}}>📍 THIS TAB IS CORE 2</span>
        <span style={{color:T.muted,fontSize:11,marginLeft:6}}>(Operating Systems domain 1.0, objective 1.5 — CLI tools). It might feel like networking content, but the actual command syntax is tested on Core 2, not Core 1.</span>
      </div>
      <div style={{padding:12,background:T.redDim,border:`1px solid ${T.red}50`,borderRadius:8,marginBottom:12}}>
        <div style={{color:T.red,fontWeight:800,fontSize:13,marginBottom:8}}>⚡ DISM → SFC Repair Order — ALWAYS This Order</div>
        {[["1","DISM /Online /Cleanup-Image /RestoreHealth","Run FIRST — repairs the Windows image that SFC depends on"],["2","sfc /scannow","Run SECOND — scans and repairs system files using the now-healthy image"]].map(([n,cmd,desc])=>(
          <div key={n} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"5px 0"}}>
            <span style={{background:T.accent,color:T.bg,borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0,marginTop:1}}>{n}</span>
            <div><code style={{color:T.green,fontSize:11,fontFamily:"monospace",wordBreak:"break-all"}}>{cmd}</code><div style={{color:T.muted,fontSize:11,marginTop:1}}>{desc}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${cat===c?T.accent:T.border}`,background:cat===c?T.accentDim:"transparent",color:cat===c?T.accent:T.muted,cursor:"pointer",fontSize:11,fontWeight:600}}>{c}</button>)}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {oss.map(o=><button key={o} onClick={()=>setOsF(o)} style={{padding:"3px 9px",borderRadius:5,border:`1px solid ${osF===o?osClr(o):T.border}`,background:osF===o?osClr(o)+"20":"transparent",color:osF===o?osClr(o):T.muted,cursor:"pointer",fontSize:10,fontWeight:600}}>{o==="All"?"🌐 All":osLabel(o)}</button>)}
        <Search value={search} onChange={setSearch} placeholder="Search commands…"/>
        <span style={{color:T.muted,fontSize:11}}>{shown.length} results</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {shown.map((c,i)=>(
          <div key={i} style={{padding:"9px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${tierClr(c.tier)}`}}>
            <div style={{display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap",marginBottom:3}}>
              <code style={{color:T.green,fontSize:12,fontFamily:"monospace",background:T.surf,padding:"2px 7px",borderRadius:4,wordBreak:"break-all",lineHeight:1.6,flex:"1 1 auto"}}>{c.cmd}</code>
              <div style={{display:"flex",gap:4,flexShrink:0,flexWrap:"wrap"}}>
                <OSTag os={c.os}/>
                {c.legacy&&<LegacyTag/>}
                <Tag tier={c.tier}/>
              </div>
            </div>
            <div style={{color:T.muted,fontSize:11,lineHeight:1.5,marginTop:2}}>
              {c.desc}
              {c.legacyNote&&<span style={{color:T.orange,marginLeft:6,fontSize:10}}>({c.legacyNote})</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:14,padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="MSC Tools & Admin Snap-ins" color={T.purple}>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {MSC_TOOLS.map(t=>(
              <div key={t.name} style={{display:"grid",gridTemplateColumns:"140px 140px 1fr",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:11,alignItems:"center"}}>
                <code style={{color:T.green,fontFamily:"monospace",fontSize:10}}>{t.name}</code>
                <span style={{color:T.accent}}>{t.opens}</span>
                <span style={{color:T.muted}}>{t.desc}</span>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
}

function SubnettingTab(){
  const hotRows=["/24","/25","/26","/27","/28","/29","/30"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <DomainBanner exam="core1" domain="Networking domain, objectives 2.4 & 2.6" note="IP addressing, DNS, DHCP, subnetting"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
          <Sec title="CIDR Table — Highlighted = Most Tested" color={T.accent}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>{["CIDR","Subnet Mask","H.Bits","Total","Usable"].map(h=><th key={h} style={{color:T.muted,padding:"4px 8px",textAlign:"left",fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
              <tbody>
                {SUBNETS.map(s=>(
                  <tr key={s.cidr} style={{background:hotRows.includes(s.cidr)?T.accentDim:"transparent",borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:"6px 8px",color:T.accent,fontFamily:"monospace",fontWeight:700}}>{s.cidr}</td>
                    <td style={{padding:"6px 8px",color:T.text,fontFamily:"monospace",fontSize:11}}>{s.mask}</td>
                    <td style={{padding:"6px 8px",color:T.yellow}}>{s.hb}</td>
                    <td style={{padding:"6px 8px",color:T.text}}>{s.total}</td>
                    <td style={{padding:"6px 8px",color:T.green,fontWeight:600}}>{s.usable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Key Formulas" color={T.green}>
              {[["Host bits","32 − CIDR"],["Total addresses","2ⁿ (n = host bits)"],["Usable hosts","2ⁿ − 2"],["Block size","256 − last subnet octet"],["Network address","All host bits = 0 (first address)"],["Broadcast address","All host bits = 1 (last address)"],["First usable","Network + 1"],["Last usable","Broadcast − 1"],["Subnets in /24","256 ÷ block size"]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                  <span style={{color:T.muted}}>{l}</span><code style={{color:T.green,fontFamily:"monospace"}}>{v}</code>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Special Addresses" color={T.yellow}>
              {[["127.0.0.1","Loopback / localhost"],["127.0.0.0/8","All loopback (reserved)"],["169.254.0.0/16","APIPA — DHCP failed"],["0.0.0.0/0","Default route (any dest)"],["255.255.255.255","Limited broadcast"],["10.x.x.x","Class A private (/8)"],["172.16–31.x.x","Class B private (/12)"],["192.168.x.x","Class C private (/16)"]].map(([ip,d])=>(
                <div key={ip} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:`1px solid ${T.border}`,fontSize:11,alignItems:"baseline"}}>
                  <code style={{color:T.accent,minWidth:130,fontSize:10}}>{ip}</code><span style={{color:T.text}}>{d}</span>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      </div>
      {/* Worked example */}
      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="Worked Example — 192.168.10.100 / 255.255.255.192 (/26)" color={T.orange}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6}}>
            {[["CIDR","/26"],["Block size","64 (256−192)"],["Subnet boundaries","0, 64, 128, 192…"],["Host .100 is in subnet",".64 subnet"],["Network address","192.168.10.64"],["First usable","192.168.10.65"],["Last usable","192.168.10.126"],["Broadcast","192.168.10.127"],["Usable hosts","62 (64−2)"],["Is .100 valid?","✓ YES — falls between .65–.126"]].map(([l,v])=>(
              <div key={l} style={{padding:"6px 8px",background:T.surf,borderRadius:5,fontSize:11}}>
                <div style={{color:T.muted,marginBottom:1}}>{l}</div>
                <div style={{color:v.includes("✓")?T.green:T.text,fontFamily:"monospace",fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
      {/* IPv4 vs IPv6 */}
      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="IPv4 vs IPv6" color={T.purple}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>
                {["Topic","IPv4","IPv6"].map((h,i)=><th key={h} style={{color:[T.muted,T.accent,T.purple][i],padding:"5px 10px",textAlign:"left",fontSize:11}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[["Bit length","32 bits (4 octets)","128 bits (16 bytes)"],["Format","Dotted decimal","Colon-separated hex"],["Example","192.168.1.1","2001:db8:85a3::8a2e:370:7334"],["Classes","A, B, C, D, E","No classes (CIDR only)"],["Typical subnet","/24 most common","/64 most common"],["Loopback","127.0.0.1","::1"],["APIPA equivalent","169.254.x.x","fe80::/10 (link-local)"]].map(([l,v4,v6])=>(
                  <tr key={l} style={{borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:"5px 10px",color:T.muted,fontSize:11}}>{l}</td>
                    <td style={{padding:"5px 10px",color:T.text,fontFamily:"monospace",fontSize:11}}>{v4}</td>
                    <td style={{padding:"5px 10px",color:T.purple,fontFamily:"monospace",fontSize:11}}>{v6}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sec>
      </div>
      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="DNS Record Types" color={T.cyan}>
          {DNS_RECORDS.map(d=>(
            <div key={d.record} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{color:T.cyan,fontFamily:"monospace",fontWeight:800,fontSize:13,minWidth:60}}>{d.record}</span>
              <div>
                {d.full&&<span style={{color:T.muted,fontSize:10.5,display:"block",marginBottom:1}}>{d.full}</span>}
                <span style={{color:T.text,fontSize:12,lineHeight:1.5}}>{d.desc}</span>
              </div>
            </div>
          ))}
        </Sec>
        <Sec title="Email Authentication (Stored as TXT Records)" color={T.yellow}>
          {EMAIL_AUTH_RECORDS.map(e=>(
            <div key={e.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{color:T.yellow,fontWeight:700,fontSize:12.5,marginBottom:1}}>{e.name} <span style={{color:T.muted,fontWeight:400,fontSize:10.5}}>({e.full})</span></div>
              <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{e.desc}</div>
            </div>
          ))}
        </Sec>
      </div>
      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="DHCP Concepts" color={T.green}>
          {DHCP_CONCEPTS.map(d=>(
            <div key={d.term} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{color:T.green,fontWeight:700,fontSize:12.5,marginBottom:1}}>{d.term}</div>
              <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{d.desc}</div>
            </div>
          ))}
        </Sec>
      </div>
      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
        <Sec title="Internet Connection Types" color={T.orange}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
            {WAN_TECHNOLOGIES.map(w=>(
              <div key={w.name} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                <div style={{color:w.color,fontWeight:700,fontSize:12}}>{w.name}{w.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10}}> ({w.full})</span>}</div>
                <div style={{color:T.muted,fontSize:11,lineHeight:1.45,marginTop:2}}>{w.desc}</div>
              </div>
            ))}
          </div>
        </Sec>
        <Sec title="Network Scope — LAN to WAN" color={T.cyan}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
            {[["PAN","Personal Area Network","One person's immediate devices (phone + smartwatch + earbuds)"],["LAN","Local Area Network","One place — a home or office"],["WLAN","Wireless LAN","A LAN using Wi-Fi instead of cables"],["MAN","Metropolitan Area Network","A city or large campus"],["SAN","Storage Area Network","Dedicated high-speed network just for storage"],["WAN","Wide Area Network","Large area — office to internet, or between cities"]].map(([abbr,full,desc])=>(
              <div key={abbr} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                <div style={{color:T.cyan,fontWeight:800,fontSize:13}}>{abbr}</div>
                <div style={{color:T.muted,fontSize:10}}>{full}</div>
                <div style={{color:T.text,fontSize:11,lineHeight:1.4,marginTop:2}}>{desc}</div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
}

function SecurityTab(){
  const [sub,setSub]=useState("malware");
  const subTabs=[
    {id:"malware",label:"🦠 Malware",exam:"core2",group:"Threats"},
    {id:"social",label:"🎭 Social Eng.",exam:"core2",group:"Threats"},
    {id:"physical",label:"🚧 Physical Security",exam:"core2",group:"Threats"},
    {id:"vpn",label:"🔐 VPNs",exam:"core2",group:"Access & Identity"},
    {id:"aaa",label:"🔑 AAA",exam:"core2",group:"Access & Identity"},
    {id:"cloud",label:"☁️ Cloud",exam:"core1",group:"Cloud & Virt (Core 1)"},
    {id:"virt",label:"🖥️ Virtualization",exam:"core1",group:"Cloud & Virt (Core 1)"},
    {id:"new",label:"🆕 New 2025",exam:"both",group:"Cloud & Virt (Core 1)"},
  ];
  const subGroups=[...new Set(subTabs.map(t=>t.group))];
  const malwareTypes=MALWARE.filter(m=>!["Phishing","Vishing","Smishing","Tailgating/Piggybacking","Shoulder Surfing","Dumpster Diving","Insider Threat","On-Path Attack","Watering Hole Attack","Impersonation","QR Code Phishing","Whaling"].includes(m.type));
  const socialTypes=MALWARE.filter(m=>["Phishing","Vishing","Smishing","Tailgating/Piggybacking","Shoulder Surfing","Dumpster Diving","Man-in-the-Middle","Insider Threat","On-Path Attack","Watering Hole Attack","Impersonation","QR Code Phishing","Whaling"].includes(m.type));
  return(
    <div>
      <div style={{padding:"9px 12px",background:T.purpleDim,border:`1px solid ${T.purple}40`,borderRadius:8,marginBottom:10,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{color:T.purple,fontWeight:800,fontSize:10.5,letterSpacing:0.5}}>📍 THIS TAB IS MOSTLY CORE 2</span>
        <span style={{color:T.muted,fontSize:11}}>(Security domain 2.0) — except <b style={{color:T.accent}}>Cloud</b> and <b style={{color:T.accent}}>Virtualization</b> below, which are Core 1 (domain 4.0), grouped here for topic convenience only.</span>
      </div>
      {subGroups.map(g=>(
        <div key={g} style={{marginBottom:6}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:1,color:T.dim,textTransform:"uppercase",marginBottom:3,paddingLeft:2}}>{g}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {subTabs.filter(t=>t.group===g).map(t=>(
              <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${sub===t.id?T.red:T.border}`,background:sub===t.id?T.red+"20":"transparent",color:sub===t.id?T.red:T.muted,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                {t.label}
                <span style={{fontSize:7,fontWeight:800,color:EXAM_BADGE_COLOR[t.exam],background:EXAM_BADGE_COLOR[t.exam]+"22",padding:"1px 4px",borderRadius:3}}>{EXAM_BADGE_LABEL[t.exam]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {sub==="malware"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{padding:12,background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:8,marginBottom:4}}>
            <div style={{color:T.red,fontWeight:700,marginBottom:6}}>Official 10-Step Malware Removal Process</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:6,fontSize:11,color:T.text}}>
              {MALWARE_STEPS.map((s,i)=><div key={i} style={{padding:"4px 8px",background:T.card,borderRadius:5}}>{s}</div>)}
            </div>
          </div>
          {malwareTypes.map(m=>(
            <div key={m.type} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.red}`}}>
              <div style={{color:T.red,fontWeight:700,fontSize:13,marginBottom:3}}>{m.type}</div>
              <div style={{color:T.text,fontSize:12,marginBottom:4,lineHeight:1.5}}>{m.desc}</div>
              <div style={{color:T.green,fontSize:11}}>✓ Fix: {m.fix}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:4}}>
            <Sec title="Detection & Removal Tools" color={T.cyan}>
              {MALWARE_DETECTION_TOOLS.map(t=>(
                <div key={t.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.cyan,fontWeight:700,fontSize:12.5,marginBottom:2}}>{t.name}{t.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({t.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{t.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="social"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {socialTypes.map(m=>(
            <div key={m.type} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.orange}`}}>
              <div style={{color:T.orange,fontWeight:700,fontSize:13,marginBottom:3}}>{m.type}</div>
              <div style={{color:T.text,fontSize:12,marginBottom:4,lineHeight:1.5}}>{m.desc}</div>
              <div style={{color:T.green,fontSize:11}}>✓ Fix: {m.fix}</div>
            </div>
          ))}
          <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:8}}>
            <Sec title="Security Concepts" color={T.cyan}>
              {[["IDS vs IPS","IDS = Intrusion DETECTION (monitors+alerts, passive). IPS = Intrusion PREVENTION (monitors+blocks, active/inline)."],["RADIUS vs TACACS+","RADIUS: combines authentication+authorization, encrypts only the password, uses UDP. TACACS+: separates authentication/authorization/accounting (AAA), encrypts the ENTIRE packet, uses TCP, Cisco-favored for device admin."],["Zero Trust Model","Never trust, always verify. No implicit trust based on network location. Verify every access, every time."],["Principle of Least Privilege","Give users ONLY the minimum permissions needed to do their job. Nothing more."],["Defense in Depth","Multiple layers of security. If one fails, others protect. No single point of failure."],["MFA","Multi-Factor Auth: combine two+ of Know/Have/Are factors. Single factor = not MFA."],["DLP","Data Loss Prevention — monitors and blocks sensitive data (credit card numbers, PII) from leaving the network via email, USB, or upload."],["IAM","Identity and Access Management — the overall framework/system for managing who has access to what across an organization (encompasses authentication, authorization, and provisioning)."],["Non-repudiation","Proof that action was taken by specific party. Digital signatures provide this."]].map(([t,d])=>(
                <div key={t} style={{padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                  <div style={{color:T.cyan,fontWeight:700,marginBottom:2}}>{t}</div>
                  <div style={{color:T.muted}}>{d}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="physical"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Physical Security Controls" color={T.orange}>
              {PHYSICAL_SECURITY.map(p=>(
                <div key={p.item} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.orange,fontWeight:700,fontSize:12.5,marginBottom:2}}>{p.item}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{p.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Physical Access Methods (Biometrics & Credentials)" color={T.purple}>
              {PHYSICAL_ACCESS_METHODS.map(p=>(
                <div key={p.method} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{p.method}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{p.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Data Destruction & Disposal Methods" color={T.red}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8}}>
                {DATA_DESTRUCTION.map(d=>(
                  <div key={d.method} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                      <span style={{color:T.red,fontWeight:700,fontSize:12}}>{d.method}</span>
                    </div>
                    <Pill color={d.category.includes("Physical")?T.red:T.green}>{d.category}</Pill>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45,marginTop:4}}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
        </div>
      )}
      {sub==="vpn"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {VPN_PROTOS.map(v=>(
            <div key={v.name} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${v.secure===true?T.green:v.secure===false?T.red:T.muted}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{color:T.text,fontWeight:700,fontSize:14}}>{v.name}</span>
                {v.legacy&&<LegacyTag/>}
                <span style={{color:v.secure===true?T.green:v.secure===false?T.red:T.muted,fontSize:11,fontWeight:600}}>{v.secure===true?"✓ Encrypted":v.secure===false?"✗ No built-in encryption":"Depends on config"}</span>
              </div>
              <div style={{color:T.muted,fontSize:12,marginBottom:3}}>{v.desc}</div>
              <div style={{color:v.note.includes("⚠️")?T.red:T.muted,fontSize:11}}>{v.note}</div>
            </div>
          ))}
        </div>
      )}
      {sub==="aaa"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:12,background:T.accentDim,border:`1px solid ${T.accent}40`,borderRadius:8}}>
            <div style={{color:T.accent,fontWeight:700,fontSize:13,marginBottom:4}}>🔑 Commonly known as "Triple-A"</div>
            <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>A security framework used to control and monitor access to network devices and resources. Every one of the three A's happens in order — you can't authorize or account for someone who hasn't been authenticated first.</div>
          </div>
          {AAA_FRAMEWORK.map((a,i)=>(
            <div key={a.step} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${T[a.color]}`}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:5}}>
                <span style={{background:T[a.color],color:T.bg,borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,flexShrink:0}}>{i+1}</span>
                <span style={{color:T[a.color],fontWeight:800,fontSize:15}}>{a.step}</span>
              </div>
              <div style={{color:T.text,fontSize:12.5,lineHeight:1.55,marginBottom:5}}>{a.desc}</div>
              <div style={{color:T.muted,fontSize:11,fontStyle:"italic"}}>{a.detail}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:4}}>
            <Sec title="AAA Components — Used on Networks to Reduce Risk" color={T.green}>
              {AAA_COMPONENTS.map(c=>(
                <div key={c.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.green,fontWeight:700,fontSize:12.5,marginBottom:2}}>
                    {c.name}{c.alsoKnownAs&&<span style={{color:T.muted,fontWeight:400,fontSize:11}}> (a.k.a. {c.alsoKnownAs})</span>}
                  </div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{c.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:12,background:T.yellowDim,border:`1px solid ${T.yellow}40`,borderRadius:8}}>
            <div style={{color:T.yellow,fontWeight:700,fontSize:12,marginBottom:4}}>💡 Real-world example (802.1X)</div>
            <div style={{color:T.muted,fontSize:11.5,lineHeight:1.6}}>A laptop (Supplicant) connects to a secured Wi-Fi access point (Network Access Device). The AP forwards the login request to a RADIUS server (AAA Server), which checks Active Directory, approves access, and logs the session. This entire flow is AAA in action.</div>
          </div>
        </div>
      )}
      {sub==="cloud"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {CLOUD.map(c=>(
            <div key={c.model} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${c.color}`}}>
              <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{color:c.color,fontWeight:800,fontSize:15}}>{c.model}</span>
                <span style={{color:T.accent,fontSize:12}}>{c.full}</span>
              </div>
              <div style={{color:T.text,fontSize:12,marginBottom:3}}>{c.desc}</div>
              <div style={{color:T.muted,fontSize:11}}>e.g. {c.ex}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:6}}>
            <Sec title="Who Manages What — The Classic IaaS/PaaS/SaaS Exam Table" color={T.orange}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5}}>
                  <thead>
                    <tr style={{borderBottom:`2px solid ${T.border}`}}>
                      <th style={{textAlign:"left",padding:"6px 8px",color:T.muted}}>Layer</th>
                      <th style={{textAlign:"center",padding:"6px 8px",color:T.text}}>On-Prem</th>
                      <th style={{textAlign:"center",padding:"6px 8px",color:T.red}}>IaaS</th>
                      <th style={{textAlign:"center",padding:"6px 8px",color:T.yellow}}>PaaS</th>
                      <th style={{textAlign:"center",padding:"6px 8px",color:T.green}}>SaaS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLOUD_RESPONSIBILITY.map(r=>(
                      <tr key={r.layer} style={{borderBottom:`1px solid ${T.border}`}}>
                        <td style={{padding:"6px 8px",color:T.text,fontWeight:600}}>{r.layer}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",color:T.muted}}>{r.onprem}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",color:r.iaas==="You"?T.accent:T.muted}}>{r.iaas}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",color:r.paas==="You"?T.accent:T.muted}}>{r.paas}</td>
                        <td style={{padding:"6px 8px",textAlign:"center",color:r.saas.includes("You")?T.accent:T.muted}}>{r.saas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{color:T.muted,fontSize:11,marginTop:8,fontStyle:"italic"}}>Read top to bottom: as you move IaaS → PaaS → SaaS, the provider takes over more layers and you manage less.</div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:6}}>
            <Sec title="Cloud Characteristics — Frequently Tested, Often Skipped" color={T.yellow}>
              {CLOUD_CHARACTERISTICS.map(c=>(
                <div key={c.term} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.yellow,fontWeight:700,fontSize:12.5,marginBottom:2}}>{c.term}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{c.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="virt"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {VIRT_TYPES.map(v=>(
            <div key={v.name} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.cyan}`}}>
              <div style={{color:T.cyan,fontWeight:700,fontSize:13,marginBottom:3}}>{v.name}</div>
              <div style={{color:T.text,fontSize:12,marginBottom:3}}>{v.desc}</div>
              <div style={{color:T.muted,fontSize:11}}>Examples: {v.ex}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:6}}>
            <Sec title="Purpose of Virtual Machines — Named Official Sub-Topics" color={T.purple}>
              {VM_PURPOSES.map(v=>(
                <div key={v.purpose} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{v.purpose}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{v.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="VM Resource Requirements" color={T.green}>
              {VM_REQUIREMENTS.map(v=>(
                <div key={v.req} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.green,fontWeight:700,fontSize:12.5,marginBottom:2}}>{v.req}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{v.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="new"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{padding:10,background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:8,fontSize:12,color:T.red,fontWeight:700}}>
            🆕 These topics are NEW or significantly expanded on 220-1201/1202 vs the old 1101/1102. Don't skip!
          </div>
          {[
            {topic:"Zero Trust",tier:"critical",desc:"Never trust, always verify. No implicit trust even inside network perimeter. Verify every access request regardless of location."},
            {topic:"TPM 2.0 + Windows 11",tier:"critical",desc:"TPM 2.0 chip required for Windows 11. Stores encryption keys, enables Secure Boot, BitLocker. Without TPM 2.0 = cannot install Win11."},
            {topic:"AI Fundamentals (Official Objective 4.10)",tier:"high",desc:"Four official sub-areas: (1) Application integration — how AI plugs into existing tools/workflows. (2) Policy — appropriate use, plagiarism concerns. (3) Limitations — bias, hallucinations, accuracy. (4) Private vs. public AI — data security, data source, data privacy considerations when choosing an AI tool."},
            {topic:"eSIM",tier:"high",desc:"Embedded SIM — no physical card. Programmed remotely. Standard on modern smartphones and laptops."},
            {topic:"Wi-Fi 6E / Wi-Fi 7",tier:"high",desc:"Wi-Fi 6E (802.11ax) adds 6 GHz band. Wi-Fi 7 (802.11be) adds Multi-Link Operation. Know both the 802.11x name AND the Wi-Fi # name."},
            {topic:"WireGuard VPN",tier:"medium",desc:"Modern lightweight VPN. ~4,000 lines of code. Built into Linux 5.6+. Faster than OpenVPN, uses modern crypto (ChaCha20, Curve25519)."},
            {topic:"ReFS File System",tier:"high",desc:"Resilient File System. Windows Server only. Built-in checksums, self-healing. Cannot be used as boot volume. More resilient than NTFS."},
            {topic:"XFS File System",tier:"medium",desc:"Linux file system. High performance, large file support, journaling. Common in RHEL/CentOS enterprise."},
            {topic:"Containers (Docker)",tier:"high",desc:"Shares host OS kernel. Lightweight vs VMs. Fast startup. Docker is most common. Kubernetes orchestrates containers."},
            {topic:"VDI",tier:"high",desc:"Virtual Desktop Infrastructure. Centrally hosted desktops. Users connect via thin clients. Easier management, central control."},
            {topic:"SDN",tier:"medium",desc:"Software-Defined Networking. Separates control plane from data plane. Network managed via software rather than hardware CLI."},
            {topic:"MFA Evolution",tier:"critical",desc:"Know: TOTP, HOTP, push notifications, hardware tokens (YubiKey), biometrics, smart cards. Know each type and factor category (Know/Have/Are)."},
          ].map(t=>(
            <div key={t.topic} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderTop:`2px solid ${tierClr(t.tier)}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{color:T.text,fontWeight:700,fontSize:13}}>{t.topic}</span><Tag tier={t.tier}/></div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.5}}>{t.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OsTab(){
  const [sub,setSub]=useState("editions");
  const subTabs=[
    {id:"editions",label:"🪟 Windows Editions",group:"Windows"},
    {id:"install",label:"💿 Windows Install",group:"Windows"},
    {id:"filesystems",label:"📁 File Systems",group:"Windows"},
    {id:"macos",label:"🍎 macOS",group:"Other OSes"},
    {id:"linux",label:"🐧 Linux",group:"Other OSes"},
    {id:"troubleshoot",label:"🔧 Troubleshooting",group:"Troubleshooting"},
    {id:"scope",label:"🔎 Connectivity Scope",group:"Troubleshooting"},
    {id:"printer",label:"🖨️ Printers",group:"Troubleshooting"},
  ];
  return(
    <div>
      <DomainBanner exam="core2" domain="Operating Systems domain 1.0" note="Connectivity Scope and Printers sub-tabs are actually Core 1 troubleshooting (5.5/5.6), grouped here for convenience"/>
      <GroupedTabs tabs={subTabs} active={sub} setActive={setSub} color={T.accent}/>
      {sub==="editions"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {WIN_EDITIONS.map(e=>(
            <div key={e.ed} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${T.accent}`}}>
              <div style={{color:T.accent,fontWeight:700,fontSize:14,marginBottom:8}}>{e.ed}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:4}}>
                {e.features.map((f,i)=><div key={i} style={{color:i===0?T.muted:f.startsWith("BitLocker")||f.startsWith("Domain")||f.startsWith("Remote Desktop")?T.green:T.text,fontSize:11,padding:"2px 0"}}>• {f}</div>)}
              </div>
            </div>
          ))}
          <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Key Windows Differences for A+ Exam" color={T.yellow}>
              {[["Domain join","Pro/Enterprise ONLY. Home cannot join Active Directory."],["gpedit.msc","Pro/Enterprise ONLY. Home has no Local Group Policy Editor."],["BitLocker","Full BitLocker on Pro+. Home has BitLocker reader only."],["Remote Desktop HOST","Pro+. Home can CONNECT to RDP but not RECEIVE connections."],["Hyper-V","Pro/Enterprise ONLY. Enable in Windows Features."],["Windows Sandbox","Pro/Enterprise. Isolated temp environment for testing."],["Windows 11 requirements","TPM 2.0 + Secure Boot + UEFI + 64-bit CPU + 4GB RAM + 64GB storage"]].map(([t,d])=>(
                <div key={t} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                  <span style={{color:T.yellow,fontWeight:700,minWidth:180}}>{t}</span>
                  <span style={{color:T.muted}}>{d}</span>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Domain vs. Workgroup" color={T.purple}>
              {DOMAIN_VS_WORKGROUP.map(d=>(
                <div key={d.model} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:13,marginBottom:3}}>{d.model}</div>
                  <div style={{color:T.text,fontSize:12,lineHeight:1.55,marginBottom:5}}>{d.desc}</div>
                  {d.traits.map((t,i)=><div key={i} style={{color:T.muted,fontSize:11,padding:"2px 0"}}>• {t}</div>)}
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="install"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Windows Installation Types" color={T.accent}>
              {WINDOWS_INSTALL_TYPES.map(w=>(
                <div key={w.type} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.accent,fontWeight:700,fontSize:12.5,marginBottom:2}}>{w.type}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{w.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Boot Methods for Installation" color={T.yellow}>
              {BOOT_METHODS.map(b=>(
                <div key={b.method} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.yellow,fontWeight:700,fontSize:12.5,marginBottom:2}}>{b.method}{b.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({b.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{b.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Partition Styles — MBR vs GPT" color={T.green}>
              {PARTITION_STYLES.map(p=>(
                <div key={p.style} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                    <span style={{color:T.green,fontWeight:800,fontSize:14}}>{p.style}</span>
                    <span style={{color:T.muted,fontSize:10.5}}>{p.full}</span>
                    {p.legacy&&<LegacyTag/>}
                  </div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{p.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="filesystems"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {fs:"NTFS",os:"Windows",color:T.accent,desc:"Default Windows file system. Supports: permissions (ACLs), EFS encryption, journaling, files >4GB, compression, quotas, hard links."},
            {fs:"FAT32",os:"Cross-platform",color:T.yellow,desc:"Legacy. Max file size 4GB. No permissions. Works on Windows, macOS, Linux. Common for USB drives and SD cards."},
            {fs:"exFAT",os:"Cross-platform",color:T.green,desc:"Extended FAT. Supports files >4GB. No permissions. Better than FAT32 for large storage. USB/SD cards."},
            {fs:"ReFS",os:"Windows Server",color:T.purple,desc:"Resilient File System. Built-in checksums. Self-healing. Not bootable. Better data integrity than NTFS. Windows Server only."},
            {fs:"ext4",os:"Linux",color:T.green,desc:"Default Linux file system. Journaling, reliable, large file support. Used in Ubuntu, Debian, and most modern Linux distros."},
            {fs:"XFS",os:"Linux",color:T.cyan,desc:"High performance Linux file system. Excellent for large files. Journaling. Default in RHEL/CentOS/Fedora."},
            {fs:"APFS",os:"macOS/iOS",color:T.muted,desc:"Apple File System. Default on macOS 10.13+, iOS, iPadOS. Optimized for SSD. Encryption, snapshots, space sharing."},
            {fs:"HFS+",os:"macOS (legacy)",color:T.muted,desc:"Hierarchical File System Plus. Legacy macOS. Replaced by APFS on modern Macs.",legacy:true},
          ].map(f=>(
            <div key={f.fs} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${f.color}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{color:f.color,fontWeight:800,fontSize:15}}>{f.fs}</span>
                <Pill color={T.muted}>{f.os}</Pill>
                {f.legacy&&<LegacyTag/>}
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.5}}>{f.desc}</div>
            </div>
          ))}
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginTop:4}}>
            <Sec title="Windows Encryption Technologies" color={T.red}>
              {WINDOWS_ENCRYPTION.map(w=>(
                <div key={w.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.red,fontWeight:700,fontSize:12.5,marginBottom:2}}>{w.name}{w.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({w.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{w.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Workstation Hardening Settings" color={T.orange}>
              {WORKSTATION_HARDENING.map(w=>(
                <div key={w.setting} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.orange,fontWeight:700,fontSize:12.5,marginBottom:2}}>{w.setting}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{w.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="macos"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:12,background:T.accentDim,border:`1px solid ${T.accent}40`,borderRadius:8}}>
            <div style={{color:T.accent,fontWeight:700,fontSize:13,marginBottom:4}}>🍎 macOS-specific tools & features</div>
            <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>Know the macOS equivalent of the Windows tool it maps to — the exam frequently tests these as direct comparisons.</div>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="macOS Features & Tools" color={T.accent}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:8}}>
                {MACOS_FEATURES.map(m=>(
                  <div key={m.name} style={{padding:9,background:T.surf,borderRadius:7,border:`1px solid ${T.border}`}}>
                    <div style={{color:T.accent,fontWeight:700,fontSize:12}}>{m.name}</div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45,marginTop:2}}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="macOS Installer File Types" color={T.yellow}>
              {MACOS_FILE_TYPES.map(m=>(
                <div key={m.ext} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"baseline"}}>
                  <code style={{color:T.yellow,fontFamily:"monospace",fontWeight:700,minWidth:50}}>{m.ext}</code>
                  <span style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{m.desc}</span>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Key macOS Folders" color={T.green}>
              {MACOS_FOLDERS.map(m=>(
                <div key={m.folder} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"baseline"}}>
                  <code style={{color:T.green,fontFamily:"monospace",fontSize:11,minWidth:120}}>{m.folder}</code>
                  <span style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{m.desc}</span>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="linux"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Linux Commands by Category" color={T.green}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:8}}>
                {LINUX_COMMANDS.map((l,i)=>(
                  <div key={i} style={{padding:8,background:T.surf,borderRadius:6,border:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                      <code style={{color:T.green,fontFamily:"monospace",fontWeight:700,fontSize:12}}>{l.cmd}</code>
                      <Pill color={T.muted}>{l.cat}</Pill>
                    </div>
                    <div style={{color:T.muted,fontSize:11,lineHeight:1.45}}>{l.desc}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Important Linux Configuration Files" color={T.cyan}>
              {LINUX_CONFIG_FILES.map(l=>(
                <div key={l.file} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"baseline"}}>
                  <code style={{color:T.cyan,fontFamily:"monospace",fontSize:11.5,minWidth:130}}>{l.file}</code>
                  <span style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{l.desc}</span>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Core Linux OS Components" color={T.purple}>
              {LINUX_OS_COMPONENTS.map(l=>(
                <div key={l.component} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{l.component}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{l.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="troubleshoot"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {prob:"BSOD (Blue Screen of Death)",causes:"Driver issue, failing RAM, corrupted OS, overheating",fix:"Note stop code → Event Viewer → sfc /scannow (after DISM) → test RAM with MemTest86 → rollback recent driver/update"},
            {prob:"Computer won't boot — no POST",causes:"Loose RAM, dead PSU, bad GPU, CPU not seated, bad CMOS battery",fix:"Check power → reseat RAM → test PSU → remove GPU → test components individually"},
            {prob:"Windows boot error / missing NTLDR",causes:"Corrupted BCD, bad MBR, missing OS files",fix:"Boot from install media → Recovery → bootrec /fixmbr → bootrec /fixboot → bootrec /rebuildbcd → sfc"},
            {prob:"No internet — can ping IPs only",causes:"DNS failure — resolver cache or DNS server issue",fix:"ipconfig /flushdns → check DNS in ipconfig /all → try 8.8.8.8 as DNS → nslookup to test"},
            {prob:"No internet — can't ping anything",causes:"DHCP failure, cable unplugged, NIC issue",fix:"Check cable/Wi-Fi → ipconfig (look for APIPA 169.254.x.x) → ipconfig /release /renew"},
            {prob:"Application won't install",causes:"Insufficient disk space, permissions, corrupted installer, .NET required",fix:"Check disk space → run as admin → check Event Viewer → verify dependencies installed"},
            {prob:"Computer very slow",causes:"Low RAM, malware, full drive, overheating, too many startup items",fix:"Task Manager → check CPU/RAM/disk usage → scan for malware → check temps → clean startup"},
            {prob:"Profile issues on login",causes:"Corrupted user profile, Group Policy issue",fix:"Create new temp profile → copy data → delete old profile from registry (HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList)"},
            {prob:"Unable to connect to network share",causes:"Permissions, firewall, SMB version mismatch",fix:"Ping server → check share/NTFS permissions → verify port 445 open → check SMB settings"},
            {prob:"Device not recognized by OS",causes:"Driver missing, USB port issue, power problem",fix:"Try different USB port/cable → Device Manager → update/reinstall driver → check BIOS settings"},
          ].map(s=>(
            <div key={s.prob} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.orange}`}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13,marginBottom:5}}>{s.prob}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11}}>
                <div><span style={{color:T.red,fontWeight:700}}>Causes: </span><span style={{color:T.muted}}>{s.causes}</span></div>
                <div><span style={{color:T.green,fontWeight:700}}>Steps: </span><span style={{color:T.muted}}>{s.fix}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {sub==="scope"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:12,background:T.accentDim,border:`1px solid ${T.accent}40`,borderRadius:8}}>
            <div style={{color:T.accent,fontWeight:700,fontSize:13,marginBottom:4}}>🔎 Establishing the Scope of a Network Problem</div>
            <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>Before touching any command, ask these questions in order to figure out whether the problem is on one device, one switch, or the whole network.</div>
          </div>
          {CONNECTIVITY_SCOPE.map((c,i)=>(
            <div key={c.q} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${T.cyan}`}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:5}}>
                <span style={{background:T.cyan,color:T.bg,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,flexShrink:0,marginTop:1}}>{i+1}</span>
                <span style={{color:T.text,fontWeight:700,fontSize:13,lineHeight:1.4}}>{c.q}</span>
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.55,paddingLeft:30}}>{c.desc}</div>
            </div>
          ))}
          <div style={{padding:12,background:T.yellowDim,border:`1px solid ${T.yellow}40`,borderRadius:8}}>
            <div style={{color:T.yellow,fontWeight:700,fontSize:12,marginBottom:4}}>💡 Why order matters</div>
            <div style={{color:T.muted,fontSize:11.5,lineHeight:1.6}}>Single host vs. multiple hosts affected tells you where to even START looking. Don't jump to checking VLAN configs if only one laptop has the issue — check that laptop's cable and NIC first.</div>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Motherboard, RAM & CPU Symptoms" color={T.red}>
              {MOBO_TROUBLESHOOTING.map(m=>(
                <div key={m.symptom} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.red,fontWeight:700,fontSize:12.5,marginBottom:2}}>{m.symptom}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{m.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Storage / RAID Symptoms" color={T.orange}>
              {STORAGE_TROUBLESHOOTING.map(s=>(
                <div key={s.symptom} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.orange,fontWeight:700,fontSize:12.5,marginBottom:2}}>{s.symptom}{s.full&&<span style={{color:T.muted,fontWeight:400,fontSize:10.5}}> ({s.full})</span>}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{s.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Display / Projector Symptoms" color={T.purple}>
              {DISPLAY_TROUBLESHOOTING.map(d=>(
                <div key={d.symptom} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.purple,fontWeight:700,fontSize:12.5,marginBottom:2}}>{d.symptom}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{d.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Additional Network Symptoms" color={T.cyan}>
              {NETWORK_TROUBLESHOOTING_EXTRA.map(n=>(
                <div key={n.symptom} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.cyan,fontWeight:700,fontSize:12.5,marginBottom:2}}>{n.symptom}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{n.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="printer"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Laser Printer Process — 7 Steps IN ORDER" color={T.yellow}>
              <div style={{color:T.muted,fontSize:11,marginBottom:8}}>Mnemonic: <span style={{color:T.yellow,fontWeight:700}}>"Really Cheap Electronics Don't Turn Fancy Clean"</span></div>
              {[["1. Raster","Image data processed and sent to the laser print engine"],["2. Charge","Photosensitive drum coated with uniform negative charge via corona wire"],["3. Expose","Laser removes charge from drum where toner should adhere"],["4. Develop","Negatively charged toner attracted to exposed (neutral) areas of drum"],["5. Transfer","Toner transferred from drum onto paper via transfer corona wire"],["6. Fuse","Heat and pressure rollers melt/fuse toner permanently to paper"],["7. Clean","Drum cleaned of any remaining toner residue for next cycle"]].map(([step,desc])=>(
                <div key={step} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:12,alignItems:"baseline"}}>
                  <span style={{color:T.yellow,fontWeight:700,minWidth:100}}>{step}</span>
                  <span style={{color:T.muted}}>{desc}</span>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Printer Troubleshooting" color={T.orange}>
              {[["Blank pages","Check ink/toner, remove protective tape, run nozzle check, clean heads (inkjet), check drum (laser)"],["Paper jams","Clear jam gently, check for torn pieces, clean rollers, check paper type"],["Streaks/lines on pages","Low toner, dirty drum unit, worn fuser, misaligned heads"],["Wrong colors","Calibrate, check cartridge levels, clean inkjet heads, replace toner"],["Printer offline","Check connection, restart Print Spooler (services.msc), verify IP address"],["Queue stuck","Stop Print Spooler, clear C:\\Windows\\System32\\spool\\PRINTERS, restart spooler"],["Poor quality","Adjust DPI settings, use correct paper type, replace cartridge if old"],["Won't print at all","Check default printer, test page, reinstall driver, check port (USB/TCP/IP)"]].map(([t,d])=>(
                <div key={t} style={{display:"flex",gap:10,padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:11}}>
                  <span style={{color:T.yellow,fontWeight:700,minWidth:160}}>{t}</span>
                  <span style={{color:T.muted}}>{d}</span>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
    </div>
  );
}

function OpsTab(){
  const [sub,setSub]=useState("backup");
  const subTabs=[{id:"backup",label:"💾 Backup"},{id:"safety",label:"⚡ Safety"},{id:"change",label:"🔄 Change Mgmt"},{id:"docs",label:"📋 Documentation"},{id:"profcomm",label:"🤝 Professionalism"},{id:"licensing",label:"📜 Licensing"},{id:"scripting",label:"📝 Scripting"}];
  return(
    <div>
      <DomainBanner exam="core2" domain="Operational Procedures domain 4.0" note="documentation, change management, backups, safety, professionalism"/>
      <Tabs tabs={subTabs} active={sub} setActive={setSub} color={T.purple}/>
      {sub==="backup"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {type:"Full Backup",color:T.accent,desc:"Backs up ALL selected data every run. Doesn't matter when it was last changed.",backup:"Slowest",restore:"Fastest (single set)"},
            {type:"Incremental Backup",color:T.green,desc:"Backs up ONLY data changed since the LAST BACKUP OF ANY TYPE (full or incremental). Fastest to run.",backup:"Fastest",restore:"Slowest (full + all incrementals)"},
            {type:"Differential Backup",color:T.yellow,desc:"Backs up data changed since the LAST FULL BACKUP. Gets larger each day until next full.",backup:"Medium (grows over time)",restore:"Fast (full + latest diff only)"},
            {type:"Synthetic Full Backup",color:T.orange,desc:"Creates a new 'full' backup by combining a previous full backup with subsequent incrementals — WITHOUT re-reading all the original data from the source. Gets the restore-speed benefit of a full backup without the time/load cost of actually running one.",backup:"Fast (built from existing backups)",restore:"Fast (single synthetic set)"},
            {type:"Snapshot",color:T.purple,desc:"Point-in-time image of a VM or storage volume. Instant capture. Common in virtualization.",backup:"Instant",restore:"Near-instant rollback"},
            {type:"3-2-1 Rule",color:T.red,desc:"3 copies of data, on 2 different media types, with 1 copy stored OFFSITE. Best practice.",backup:"Standard",restore:"Covers most failure scenarios"},
          ].map(b=>(
            <div key={b.type} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${b.color}`}}>
              <div style={{color:b.color,fontWeight:700,fontSize:14,marginBottom:5}}>{b.type}</div>
              <div style={{color:T.text,fontSize:12,marginBottom:6,lineHeight:1.5}}>{b.desc}</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div style={{fontSize:11}}><span style={{color:T.muted}}>Backup speed: </span><span style={{color:T.yellow}}>{b.backup}</span></div>
                <div style={{fontSize:11}}><span style={{color:T.muted}}>Restore speed: </span><span style={{color:T.green}}>{b.restore}</span></div>
              </div>
            </div>
          ))}
          <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Backup Rotation Schemes" color={T.orange}>
              {[["GFS Rotation","Grandfather-Father-Son — a tiered backup schedule: daily backups (Son) get rotated/overwritten frequently, weekly backups (Father) are kept longer, and monthly backups (Grandfather) are kept longest. Balances storage cost against how far back you can restore."],["Onsite vs. Offsite","Onsite copies are fast to restore from but vulnerable to local disasters (fire, theft). Offsite copies (physical or cloud) protect against site-wide loss but are slower to retrieve."]].map(([t,d])=>(
                <div key={t} style={{padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                  <div style={{color:T.orange,fontWeight:700,marginBottom:2}}>{t}</div>
                  <div style={{color:T.muted}}>{d}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Disaster Recovery Terms" color={T.cyan}>
              {[["RTO","Recovery Time Objective — Maximum acceptable TIME to restore systems after failure."],["RPO","Recovery Point Objective — Maximum acceptable DATA LOSS measured in time (how old can backup be?)."],["Failover","Automatic switch to backup system when primary fails."],["High Availability","System designed to minimize downtime — often 99.99%+ uptime ('four nines')."],["Redundancy","Duplicate components to prevent single points of failure."]].map(([t,d])=>(
                <div key={t} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                  <span style={{color:T.cyan,fontWeight:700,minWidth:50}}>{t}</span><span style={{color:T.muted}}>{d}</span>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="safety"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {item:"ESD (Electrostatic Discharge)",tier:"critical",desc:"Use anti-static wrist strap grounded to case. Anti-static mat. Avoid carpeted floors. Touch metal case first. Keep components in anti-static bags until install."},
            {item:"Power Off & Unplug",tier:"critical",desc:"Always power off AND unplug before working inside PC. Capacitors can hold dangerous charge — wait 30 seconds after unplugging."},
            {item:"Electrical Safety / Grounding",tier:"critical",desc:"Ensure equipment is properly grounded before working on it — an ungrounded system creates shock risk to you and can also damage components. Never work on live/powered electrical equipment."},
            {item:"Surge Suppressor / UPS",tier:"high",desc:"A surge suppressor absorbs voltage spikes to protect equipment. A UPS goes further — adds battery backup so equipment stays running (or shuts down gracefully) during a power outage. Not the same device, though some products combine both functions."},
            {item:"Proper Lifting Technique",tier:"high",desc:"Lift with legs, not back. Get help for heavy equipment (servers, UPS units, monitors). Use dolly/cart for heavy items."},
            {item:"Fire Safety",tier:"high",desc:"Never use water on electrical fires. Use CO2 or halon/clean agent extinguisher near electronics. Know the location of nearest extinguisher."},
            {item:"Battery Disposal",tier:"high",desc:"Lithium batteries = fire hazard in landfill. Use designated recycling (Best Buy, Staples, municipal programs). Never puncture or incinerate."},
            {item:"Toner Disposal",tier:"medium",desc:"Some toner is carcinogenic. Don't use regular vacuum (toner too fine). Use HEPA vacuum or toner vacuum. Follow SDS/MSDS for disposal."},
            {item:"MSDS / SDS",tier:"high",desc:"Material Safety Data Sheet / Safety Data Sheet. Required documentation for all hazardous materials. Contains safe handling, first aid, disposal information."},
            {item:"Compressed Air",tier:"medium",desc:"Hold can upright to prevent liquid propellant spray. Don't spin fans with air — can over-speed and damage bearings. Use short bursts."},
            {item:"Cable Management",tier:"medium",desc:"Route cables away from walkways. Zip ties or velcro — never overly tight. Label cables. Prevent trip hazards and ensure airflow."},
            {item:"Ergonomics",tier:"low",desc:"Adjust monitor at eye level. Keyboard at elbow height. Take breaks, stretch. Proper chair with lumbar support. Prevent RSI."},
          ].map(s=>(
            <div key={s.item} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${tierClr(s.tier)}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{color:T.text,fontWeight:700,fontSize:13}}>{s.item}</span><Tag tier={s.tier}/>
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.5}}>{s.desc}</div>
            </div>
          ))}
        </div>
      )}
      {sub==="change"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Types of Change" color={T.cyan}>
              {CHANGE_TYPES.map(c=>(
                <div key={c.type} style={{padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.cyan,fontWeight:700,fontSize:13,marginBottom:2}}>{c.type}</div>
                  <div style={{color:T.muted,fontSize:12,lineHeight:1.5}}>{c.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Change Process Elements" color={T.green}>
              {CHANGE_PROCESS_ELEMENTS.map(c=>(
                <div key={c.term} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.green,fontWeight:700,fontSize:12.5,marginBottom:2}}>{c.term}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{c.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="docs"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Documentation & Ticketing Systems" color={T.yellow}>
              {DOCUMENTATION_SYSTEMS.map(d=>(
                <div key={d.term} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.yellow,fontWeight:700,fontSize:12.5,marginBottom:2}}>{d.term}</div>
                  <div style={{color:T.muted,fontSize:11.5,lineHeight:1.5}}>{d.desc}</div>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="profcomm"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Do's and Don'ts — Professionalism" color={T.green}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{color:T.green,fontWeight:700,fontSize:12,marginBottom:6}}>✓ DO</div>
                <div style={{color:T.red,fontWeight:700,fontSize:12,marginBottom:6}}>✗ DON'T</div>
                {PROF_COMM.map((p,i)=>(
                  <div key={i} style={{display:"contents"}}>
                    <div style={{color:T.text,fontSize:11,padding:"4px 0",borderBottom:`1px solid ${T.border}`}}>• {p.do}</div>
                    <div style={{color:T.muted,fontSize:11,padding:"4px 0",borderBottom:`1px solid ${T.border}`}}>• {p.dont}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>
          <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Change Management Process" color={T.cyan}>
              {["Request change — identify what needs to change and why","Assess impact and risk — what could break?","Get approval — from manager, change advisory board","Test in non-production environment first","Schedule maintenance window — notify affected users","Implement the change","Verify — confirm change worked correctly","Document — what changed, when, who, why, result","Rollback plan — have one BEFORE you start"].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:12,alignItems:"baseline"}}>
                  <span style={{color:T.cyan,fontWeight:700,minWidth:20}}>{i+1}.</span><span style={{color:T.muted}}>{s}</span>
                </div>
              ))}
            </Sec>
          </div>
        </div>
      )}
      {sub==="licensing"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {LICENSING.map(l=>(
            <div key={l.type} style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,borderLeft:`3px solid ${T.purple}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span style={{color:T.purple,fontWeight:700,fontSize:13}}>{l.type}</span>
                <span style={{color:T.muted,fontSize:11}}>{l.full}</span>
                {l.legacy&&<LegacyTag/>}
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.5}}>{l.desc}</div>
            </div>
          ))}
        </div>
      )}
      {sub==="scripting"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {lang:"PowerShell",ext:".ps1",os:"win",desc:"Microsoft's modern scripting language. Object-oriented. Full .NET access. Best for Windows automation, AD management, system admin.",ex:"Get-Process | Where-Object {$_.CPU -gt 50}"},
            {lang:"Batch",ext:".bat / .cmd",os:"win",desc:"Legacy Windows scripting. Simple sequential commands. Limited logic. Still used for basic automation.",ex:"ipconfig /release && ipconfig /renew",legacy:true},
            {lang:"Bash",ext:".sh",os:"linux",desc:"Default shell scripting on Linux/macOS. Most used for automation, file management, system admin on Unix systems.",ex:"chmod +x script.sh && ./script.sh"},
            {lang:"Python",ext:".py",os:"both",desc:"Cross-platform. Readable syntax. Wide library support. Used for automation, data processing, web scraping, network scripts.",ex:"import subprocess; subprocess.run(['ipconfig'])"},
            {lang:"VBScript",ext:".vbs",os:"win",desc:"Legacy Windows scripting via Windows Script Host. Mostly replaced by PowerShell.",ex:'MsgBox "Hello World"',legacy:true},
          ].map(s=>(
            <div key={s.lang} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,borderLeft:`3px solid ${T.green}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{color:T.green,fontWeight:700,fontSize:14}}>{s.lang}</span>
                <Pill color={T.muted}>{s.ext}</Pill>
                <OSTag os={s.os}/>
                {s.legacy&&<LegacyTag/>}
              </div>
              <div style={{color:T.muted,fontSize:12,lineHeight:1.5,marginBottom:6}}>{s.desc}</div>
              <code style={{color:T.yellow,fontSize:11,fontFamily:"monospace",background:T.surf,padding:"4px 8px",borderRadius:4,display:"block",wordBreak:"break-all"}}>{s.ex}</code>
            </div>
          ))}
          <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9}}>
            <Sec title="Scripting Concepts You Need to Know" color={T.accent}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,fontSize:11,color:T.muted}}>
                {[["Variables","Store reusable values: $name, name='value'"],["Loops","Repeat actions: for, while, foreach, do-while"],["Conditionals","Branch logic: if/else, switch/case"],["Functions","Group reusable code blocks"],["Comments","Document code: #, ::, REM, <!-- -->"],["Pipes ( | )","Chain command output to next command"],["Environment vars","%TEMP%, $PATH, $HOME — OS-level variables"],["Exit codes","0 = success, non-zero = error in most scripting"]].map(([t,d])=>(
                  <div key={t} style={{padding:7,background:T.surf,borderRadius:5}}><div style={{color:T.accent,fontWeight:700,marginBottom:2}}>{t}</div><div>{d}</div></div>
                ))}
              </div>
            </Sec>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FLASHCARD TAB ────────────────────────────────────────────────────────────
function FlashcardsTab(){
  const cats=["All",...[...new Set(FLASHCARDS.map(f=>f.cat))]];
  const shuffle=arr=>[...arr].sort(()=>Math.random()-0.5);
  const STORAGE_KEY="aplus_flashcard_mastery";

  // Persistent mastery map: {cardId: {status:"new"|"learning"|"known", lastSeen:timestamp, timesAgain:n, timesGot:n}}
  const loadMastery=()=>{
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");}catch(e){return {};}
  };
  const saveMastery=(m)=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(m));}catch(e){}
  };

  const [mastery,setMastery]=useState(loadMastery);
  const [mode,setMode]=useState("study"); // study | review | category
  const [catF,setCatF]=useState("All");
  const [deck,setDeck]=useState(()=>shuffle(FLASHCARDS));
  const [idx,setIdx]=useState(0);
  const [flipped,setFlip]=useState(false);
  const [showHint,setShowHint]=useState(false);
  const [sessionKnown,setSessionKnown]=useState(new Set());
  const [sessionAgain,setSessionAgain]=useState(new Set());
  const [sessionDone,setSessionDone]=useState(false);

  const buildDeck=(m,c)=>{
    let pool=FLASHCARDS;
    if(m==="review"){
      pool=FLASHCARDS.filter(f=>{
        const rec=mastery[f.id];
        return rec&&rec.status!=="known";
      });
      if(pool.length===0)pool=FLASHCARDS; // fallback if nothing due
    }else if(c&&c!=="All"){
      pool=FLASHCARDS.filter(f=>f.cat===c);
    }
    return shuffle(pool);
  };

  const startSession=(newMode,newCat)=>{
    const m=newMode!==undefined?newMode:mode;
    const c=newCat!==undefined?newCat:catF;
    setMode(m);setCatF(c);
    setDeck(buildDeck(m,c));
    setIdx(0);setFlip(false);setShowHint(false);
    setSessionKnown(new Set());setSessionAgain(new Set());setSessionDone(false);
  };

  const card=deck[idx];
  const total=deck.length;
  const sessionProgress=total>0?Math.round(((sessionKnown.size+sessionAgain.size)/total)*100):0;

  const updateMastery=(cardId,gotIt)=>{
    setMastery(prev=>{
      const rec=prev[cardId]||{status:"new",timesAgain:0,timesGot:0};
      const timesGot=gotIt?rec.timesGot+1:rec.timesGot;
      const timesAgain=gotIt?rec.timesAgain:rec.timesAgain+1;
      // Promote to "known" after 2 correct in a row net of misses; demote on miss
      let status=rec.status;
      if(gotIt){
        status = (rec.status==="learning"&&timesGot>=2)?"known":"learning";
      }else{
        status="learning";
      }
      const next={...prev,[cardId]:{status,timesAgain,timesGot,lastSeen:Date.now()}};
      saveMastery(next);
      return next;
    });
  };

  const next=(knowIt)=>{
    if(knowIt)setSessionKnown(k=>new Set([...k,idx]));
    else setSessionAgain(a=>new Set([...a,idx]));
    if(card)updateMastery(card.id,knowIt);
    setFlip(false);setShowHint(false);
    if(idx+1>=total){
      setTimeout(()=>setSessionDone(true),150);
    }else{
      setTimeout(()=>setIdx(n=>n+1),130);
    }
  };

  // Mastery stats for the dashboard (cheap to recompute each render — ~186 items)
  const masteryStats=(()=>{
    let known=0,learning=0,fresh=0;
    FLASHCARDS.forEach(f=>{
      const rec=mastery[f.id];
      if(!rec)fresh++;
      else if(rec.status==="known")known++;
      else learning++;
    });
    return {known,learning,fresh,total:FLASHCARDS.length};
  })();

  const catMastery=cats.filter(c=>c!=="All").map(c=>{
    const cardsInCat=FLASHCARDS.filter(f=>f.cat===c);
    const knownInCat=cardsInCat.filter(f=>mastery[f.id]?.status==="known").length;
    return {cat:c,total:cardsInCat.length,known:knownInCat,pct:Math.round((knownInCat/cardsInCat.length)*100)};
  });

  const dueCount=FLASHCARDS.filter(f=>{const r=mastery[f.id];return r&&r.status!=="known";}).length;

  const resetAllProgress=()=>{
    setMastery({});
    saveMastery({});
    startSession("study","All");
  };

  // ── Session summary screen ──
  if(sessionDone){
    const pct=Math.round((sessionKnown.size/total)*100);
    return(
      <div style={{maxWidth:560,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:8}}>{pct>=80?"🎉":pct>=50?"👍":"📚"}</div>
        <div style={{color:T.text,fontWeight:800,fontSize:22,marginBottom:4}}>Session Complete</div>
        <div style={{color:T.muted,fontSize:13,marginBottom:20}}>{sessionKnown.size} of {total} marked "Got It" this round ({pct}%)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          <div style={{padding:12,background:T.greenDim,borderRadius:9,border:`1px solid ${T.green}40`}}>
            <div style={{color:T.green,fontWeight:800,fontSize:20}}>{masteryStats.known}</div>
            <div style={{color:T.muted,fontSize:10}}>Mastered</div>
          </div>
          <div style={{padding:12,background:T.yellowDim,borderRadius:9,border:`1px solid ${T.yellow}40`}}>
            <div style={{color:T.yellow,fontWeight:800,fontSize:20}}>{masteryStats.learning}</div>
            <div style={{color:T.muted,fontSize:10}}>Learning</div>
          </div>
          <div style={{padding:12,background:T.surf,borderRadius:9,border:`1px solid ${T.border}`}}>
            <div style={{color:T.muted,fontWeight:800,fontSize:20}}>{masteryStats.fresh}</div>
            <div style={{color:T.muted,fontSize:10}}>Not Yet Seen</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={()=>startSession("review","All")} style={{padding:"11px 20px",borderRadius:8,border:`1px solid ${T.orange}`,background:T.orangeDim,color:T.orange,cursor:"pointer",fontWeight:700,fontSize:13}}>↺ Review {dueCount} Due Cards</button>
          <button onClick={()=>startSession("study","All")} style={{padding:"11px 20px",borderRadius:8,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:700,fontSize:13}}>🔀 New Shuffled Session</button>
        </div>
      </div>
    );
  }

  if(!card)return(
    <div style={{textAlign:"center",padding:40}}>
      <div style={{color:T.muted,marginBottom:12}}>No cards in this selection.</div>
      <button onClick={()=>startSession("study","All")} style={{padding:"9px 18px",borderRadius:7,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontSize:12}}>Reset to All Cards</button>
    </div>
  );

  return(
    <div style={{maxWidth:600,margin:"0 auto"}}>
      {/* Mastery dashboard */}
      <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{color:T.text,fontWeight:700,fontSize:12}}>📊 Overall Mastery — {masteryStats.total} cards</span>
          <button onClick={resetAllProgress} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.dim,padding:"2px 8px",borderRadius:5,cursor:"pointer",fontSize:10}}>Reset Progress</button>
        </div>
        <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:6}}>
          <div style={{width:`${(masteryStats.known/masteryStats.total)*100}%`,background:T.green}}/>
          <div style={{width:`${(masteryStats.learning/masteryStats.total)*100}%`,background:T.yellow}}/>
          <div style={{width:`${(masteryStats.fresh/masteryStats.total)*100}%`,background:T.dim}}/>
        </div>
        <div style={{display:"flex",gap:14,fontSize:10.5}}>
          <span style={{color:T.green}}>● {masteryStats.known} mastered</span>
          <span style={{color:T.yellow}}>● {masteryStats.learning} learning</span>
          <span style={{color:T.muted}}>● {masteryStats.fresh} new</span>
        </div>
      </div>

      {/* Mode picker */}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <button onClick={()=>startSession("study","All")} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${mode==="study"?T.accent:T.border}`,background:mode==="study"?T.accentDim:"transparent",color:mode==="study"?T.accent:T.muted,cursor:"pointer",fontSize:11.5,fontWeight:600}}>🔀 Study All</button>
        <button onClick={()=>startSession("review","All")} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${mode==="review"?T.orange:T.border}`,background:mode==="review"?T.orangeDim:"transparent",color:mode==="review"?T.orange:T.muted,cursor:"pointer",fontSize:11.5,fontWeight:600}}>🎯 Review Due ({dueCount})</button>
      </div>

      {/* Category filter row */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {cats.map(c=>{
          const cm=catMastery.find(x=>x.cat===c);
          return(
            <button key={c} onClick={()=>startSession("category",c)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${catF===c&&mode==="category"?T.accent:T.border}`,background:catF===c&&mode==="category"?T.accentDim:"transparent",color:catF===c&&mode==="category"?T.accent:T.muted,cursor:"pointer",fontSize:10.5,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
              {c}{cm?<span style={{fontSize:9,opacity:0.7}}>{cm.pct}%</span>:null}
            </button>
          );
        })}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{color:T.muted,fontSize:12}}>{idx+1} / {total} cards</span>
        <div style={{display:"flex",gap:14}}><span style={{color:T.green,fontSize:12}}>✓ {sessionKnown.size}</span><span style={{color:T.red,fontSize:12}}>✗ {sessionAgain.size}</span></div>
      </div>

      {/* Session progress */}
      <div style={{background:T.surf,borderRadius:4,height:4,marginBottom:16}}>
        <div style={{background:T.accent,height:4,borderRadius:4,width:`${sessionProgress}%`,transition:"width 0.3s"}}/>
      </div>

      {/* Category + mastery badge */}
      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8}}>
        <Pill color={T.purple}>{card.cat}</Pill>
        {mastery[card.id]?.status==="known"&&<Pill color={T.green}>✓ Mastered</Pill>}
        {mastery[card.id]?.status==="learning"&&<Pill color={T.yellow}>Learning</Pill>}
      </div>

      {/* Card */}
      <div onClick={()=>{setFlip(f=>!f);setShowHint(false);}} style={{cursor:"pointer",minHeight:190,background:T.card,border:`2px solid ${flipped?T.green:T.border}`,borderRadius:12,padding:22,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"border-color 0.2s",userSelect:"none"}}>
        <div style={{color:T.muted,fontSize:10,letterSpacing:2,marginBottom:12,textTransform:"uppercase"}}>{flipped?"ANSWER":"QUESTION — tap to flip"}</div>
        <div style={{color:flipped?T.green:T.text,fontSize:15,fontWeight:flipped?400:600,lineHeight:1.7,whiteSpace:"pre-line",maxWidth:480}}>{flipped?card.a:card.q}</div>
      </div>

      {/* Hint */}
      {!flipped&&card.hint&&(
        <div style={{marginTop:8,textAlign:"center"}}>
          <button onClick={e=>{e.stopPropagation();setShowHint(h=>!h);}} style={{background:"transparent",border:`1px solid ${T.yellow}50`,color:T.yellow,padding:"3px 12px",borderRadius:5,cursor:"pointer",fontSize:11}}>
            {showHint?"Hide":"💡 Show"} Hint
          </button>
          {showHint&&<div style={{marginTop:6,padding:"8px 12px",background:T.yellowDim,border:`1px solid ${T.yellow}40`,borderRadius:6,fontSize:12,color:T.yellow}}>{card.hint}</div>}
        </div>
      )}

      {/* Buttons */}
      <div style={{marginTop:10}}>
        {flipped?(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>next(false)} style={{padding:"11px",borderRadius:8,border:`1px solid ${T.red}`,background:T.redDim,color:T.red,cursor:"pointer",fontWeight:700,fontSize:14}}>✗ Again</button>
            <button onClick={()=>next(true)}  style={{padding:"11px",borderRadius:8,border:`1px solid ${T.green}`,background:T.greenDim,color:T.green,cursor:"pointer",fontWeight:700,fontSize:14}}>✓ Got It</button>
          </div>
        ):(
          <button onClick={()=>setFlip(true)} style={{width:"100%",padding:"11px",borderRadius:8,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:700,fontSize:14}}>Reveal Answer</button>
        )}
      </div>
    </div>
  );
}


// ─── EXAM SIMULATOR ──────────────────────────────────────────────────────────
function ExamTab(){
  const [started,setStarted]=useState(false);
  const [qi,setQi]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [log,setLog]=useState([]);
  const [showExp,setShowExp]=useState(false);
  const [showHint,setShowHint]=useState(false);
  const [timeLeft,setTimeLeft]=useState(90*60); // 90 min
  const [order]=useState(()=>[...Array(EXAM_QUESTIONS.length).keys()].sort(()=>Math.random()-0.5));
  const timerRef=useRef(null);

  useEffect(()=>{
    if(started&&!done){
      timerRef.current=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);setDone(true);return 0;}return t-1;}),1000);
    }
    return()=>clearInterval(timerRef.current);
  },[started,done]);

  const q=EXAM_QUESTIONS[order[qi]];
  const mins=Math.floor(timeLeft/60).toString().padStart(2,"0");
  const secs=(timeLeft%60).toString().padStart(2,"0");
  const timerColor=timeLeft<300?T.red:timeLeft<600?T.yellow:T.green;

  const pick=(i)=>{
    if(selected!==null)return;
    setSelected(i);
    if(i===q.a)setScore(s=>s+1);
    setLog(l=>[...l,{q:q.q,domain:q.domain,picked:q.opts[i],correct:q.opts[q.a],right:i===q.a,exp:q.exp}]);
  };
  const nextQ=()=>{
    if(qi+1>=EXAM_QUESTIONS.length){clearInterval(timerRef.current);setDone(true);return;}
    setQi(n=>n+1);setSelected(null);setShowExp(false);setShowHint(false);
  };
  const reset=()=>{
    clearInterval(timerRef.current);
    setStarted(false);setQi(0);setSelected(null);setScore(0);setDone(false);setLog([]);setShowExp(false);setShowHint(false);setTimeLeft(90*60);
  };

  if(!started)return(
    <div style={{maxWidth:540,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:50,marginBottom:12}}>🧪</div>
      <div style={{color:T.accent,fontWeight:800,fontSize:22,marginBottom:8}}>CompTIA A+ Exam Simulator</div>
      <div style={{color:T.muted,fontSize:13,marginBottom:14,lineHeight:1.7}}>
        {EXAM_QUESTIONS.length} scenario-based multiple-choice questions spanning both Core 1 and Core 2.<br/>
        Timer: 90 minutes (same as real exam).<br/>
        Hints and explanations available after answering.
      </div>
      <div style={{padding:"10px 14px",background:T.purpleDim,border:`1px solid ${T.purple}40`,borderRadius:8,marginBottom:16,fontSize:11,color:T.muted,textAlign:"left"}}>
        💡 <span style={{color:T.purple,fontWeight:600}}>Note:</span> This tab covers multiple-choice scenarios. The real exam ALSO includes 1–10 true Performance-Based Questions (drag-to-order, drag-to-match) at the start. Practice those in the <span style={{color:T.purple,fontWeight:600}}>🧩 PBQ Sim</span> tab.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[["Questions",`${EXAM_QUESTIONS.length} multiple choice`,T.accent],["Time Limit","90 minutes",T.yellow],["Pass Target","85%+ before real exam",T.green]].map(([l,v,c])=>(
          <div key={l} style={{padding:12,background:T.card,borderRadius:8,border:`1px solid ${T.border}`}}>
            <div style={{color:T.muted,fontSize:10}}>{l}</div>
            <div style={{color:c,fontWeight:700,fontSize:14,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>setStarted(true)} style={{padding:"14px 40px",borderRadius:10,border:`2px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:800,fontSize:18}}>
        Start Exam →
      </button>
    </div>
  );

  if(done){
    const pct=Math.round(score/EXAM_QUESTIONS.length*100);
    const passed=pct>=75;
    const domainScores={};
    log.forEach(e=>{if(!domainScores[e.domain])domainScores[e.domain]={right:0,total:0};domainScores[e.domain].total++;if(e.right)domainScores[e.domain].right++;});
    return(
      <div style={{maxWidth:580,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:56,marginBottom:8}}>{pct>=90?"🏆":pct>=75?"✅":"📚"}</div>
          <div style={{color:pct>=75?T.green:T.red,fontSize:22,fontWeight:800,marginBottom:4}}>{pct>=90?"Outstanding!":pct>=75?"Passed!":"Not Yet — Keep Studying"}</div>
          <div style={{color:T.text,fontSize:44,fontWeight:800}}>{score}/{EXAM_QUESTIONS.length}</div>
          <div style={{color:T.muted,fontSize:14,marginBottom:4}}>{pct}% correct</div>
          <div style={{color:pct>=75?T.green:T.red,fontSize:13}}>Real A+ Core 1 pass: 675/900 (~75%) | Core 2: 700/900 (~78%)</div>
        </div>
        {/* Domain breakdown */}
        <div style={{padding:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,marginBottom:14}}>
          <div style={{color:T.accent,fontWeight:700,marginBottom:8,fontSize:13}}>Performance by Domain</div>
          {Object.entries(domainScores).map(([domain,{right,total}])=>{
            const dp=Math.round(right/total*100);
            return(
              <div key={domain} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:T.text}}>{domain}</span>
                  <span style={{color:dp>=75?T.green:T.red,fontWeight:700}}>{right}/{total} ({dp}%)</span>
                </div>
                <div style={{background:T.dim,borderRadius:3,height:5}}>
                  <div style={{background:dp>=75?T.green:T.red,borderRadius:3,height:5,width:`${dp}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
        {/* Review */}
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {log.map((e,i)=>(
            <div key={i} style={{padding:10,borderRadius:7,background:e.right?T.greenDim:T.redDim,border:`1px solid ${e.right?T.green:T.red}40`}}>
              <div style={{color:e.right?T.green:T.red,fontWeight:700,fontSize:11,marginBottom:3}}>Q{i+1} [{e.domain}]: {e.q}</div>
              <div style={{color:T.muted,fontSize:11}}>Your answer: <span style={{color:e.right?T.green:T.red}}>{e.picked}</span></div>
              {!e.right&&<div style={{color:T.green,fontSize:11}}>✓ Correct: {e.correct}</div>}
              <div style={{color:T.muted,fontSize:10,marginTop:3,fontStyle:"italic"}}>{e.exp}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}>
          <button onClick={reset} style={{padding:"12px 30px",borderRadius:8,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:700,fontSize:15}}>↺ Try Again</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{maxWidth:560,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <span style={{color:T.muted,fontSize:12}}>Q {qi+1} / {EXAM_QUESTIONS.length}</span>
        <span style={{color:timerColor,fontFamily:"monospace",fontSize:16,fontWeight:700}}>⏱ {mins}:{secs}</span>
        <span style={{color:T.green,fontSize:12}}>Score: {score}/{qi}</span>
      </div>
      {/* Progress */}
      <div style={{background:T.surf,borderRadius:4,height:4,marginBottom:12}}>
        <div style={{background:T.accent,height:4,borderRadius:4,width:`${(qi/EXAM_QUESTIONS.length)*100}%`,transition:"width 0.3s"}}/>
      </div>
      {/* Domain & Difficulty */}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <Pill color={T.purple}>{q.domain}</Pill>
        <Pill color={q.diff==="hard"?T.red:q.diff==="medium"?T.yellow:T.green}>{q.diff.toUpperCase()}</Pill>
      </div>
      {/* Question */}
      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:12}}>
        <div style={{color:T.text,fontSize:14,fontWeight:600,lineHeight:1.7}}>{q.q}</div>
      </div>
      {/* Hint button (before answering) */}
      {selected===null&&(
        <div style={{marginBottom:10}}>
          <button onClick={()=>setShowHint(h=>!h)} style={{background:"transparent",border:`1px solid ${T.yellow}50`,color:T.yellow,padding:"4px 12px",borderRadius:5,cursor:"pointer",fontSize:11}}>
            {showHint?"Hide":"💡 Show"} Hint
          </button>
          {showHint&&<div style={{marginTop:6,padding:"8px 12px",background:T.yellowDim,border:`1px solid ${T.yellow}40`,borderRadius:6,fontSize:12,color:T.yellow}}>{q.hint}</div>}
        </div>
      )}
      {/* Options */}
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
        {q.opts.map((opt,i)=>{
          let border=T.border,bg="transparent",col=T.text;
          if(selected!==null){
            if(i===q.a){border=T.green;bg=T.greenDim;col=T.green;}
            else if(i===selected){border=T.red;bg=T.redDim;col=T.red;}
          }
          return(
            <button key={i} onClick={()=>pick(i)} style={{padding:"11px 14px",borderRadius:8,border:`1px solid ${border}`,background:bg,color:col,cursor:selected!==null?"default":"pointer",textAlign:"left",fontSize:13,lineHeight:1.5,transition:"all 0.18s"}}>
              <span style={{color:T.muted,marginRight:10,fontWeight:700}}>{"ABCD"[i]}.</span>{opt}
            </button>
          );
        })}
      </div>
      {/* After answering */}
      {selected!==null&&(
        <div>
          <button onClick={()=>setShowExp(s=>!s)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,padding:"4px 12px",borderRadius:5,cursor:"pointer",fontSize:11,marginBottom:8}}>
            {showExp?"Hide":"Show"} Full Explanation
          </button>
          {showExp&&<div style={{padding:10,background:T.surf,borderRadius:7,fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:8}}>{q.exp}</div>}
          <button onClick={nextQ} style={{width:"100%",padding:"12px",borderRadius:8,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:700,fontSize:14}}>
            {qi+1>=EXAM_QUESTIONS.length?"See Results →":"Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PBQ SIMULATOR ────────────────────────────────────────────────────────────
// Mimics real CompTIA PBQ format: drag-to-order and drag-to-match.
// Pointer-events based (works for mouse AND touch) — no external DnD library needed.

function OrderingPBQ({pbq,onSubmit,onReset,result}){
  const [items,setItems]=useState(()=>shuffleArr(pbq.items.map((t,i)=>({text:t,origIdx:i}))));
  const [dragIdx,setDragIdx]=useState(null);
  const containerRef=useRef(null);

  function shuffleArr(a){const arr=[...a];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

  const moveItem=(from,to)=>{
    setItems(prev=>{
      const next=[...prev];
      const [moved]=next.splice(from,1);
      next.splice(to,0,moved);
      return next;
    });
  };

  // Simple up/down reordering — most reliable on mobile, mirrors real PBQ behavior
  const moveUp=(i)=>{if(i>0)moveItem(i,i-1);};
  const moveDown=(i)=>{if(i<items.length-1)moveItem(i,i+1);};

  const submit=()=>{
    const userOrder=items.map(it=>it.origIdx);
    const correct=userOrder.every((v,i)=>v===pbq.correct[i]);
    onSubmit(correct,userOrder);
  };

  const reset=()=>{
    setItems(shuffleArr(pbq.items.map((t,i)=>({text:t,origIdx:i}))));
    onReset();
  };

  return(
    <div>
      <div style={{padding:12,background:T.surf,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:14,fontSize:12,color:T.muted,lineHeight:1.6}}>
        📋 {pbq.instructions}
        <div style={{color:T.accent,marginTop:4,fontSize:11}}>Use ▲▼ arrows to reorder items into the correct sequence.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {items.map((it,i)=>{
          let bg=T.card,border=T.border,col=T.text;
          if(result){
            const isCorrect=it.origIdx===pbq.correct[i];
            bg=isCorrect?T.greenDim:T.redDim;border=isCorrect?T.green:T.red;col=isCorrect?T.green:T.red;
          }
          return(
            <div key={it.origIdx} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:bg,border:`1px solid ${border}`,borderRadius:8}}>
              <span style={{color:T.accent,fontFamily:"monospace",fontWeight:700,minWidth:22}}>{i+1}</span>
              <span style={{color:col,fontSize:13,flex:1}}>{it.text}</span>
              {!result&&(
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <button onClick={()=>moveUp(i)} disabled={i===0} style={{background:"transparent",border:`1px solid ${T.border}`,color:i===0?T.dim:T.accent,borderRadius:4,width:24,height:18,cursor:i===0?"default":"pointer",fontSize:10,padding:0,lineHeight:1}}>▲</button>
                  <button onClick={()=>moveDown(i)} disabled={i===items.length-1} style={{background:"transparent",border:`1px solid ${T.border}`,color:i===items.length-1?T.dim:T.accent,borderRadius:4,width:24,height:18,cursor:i===items.length-1?"default":"pointer",fontSize:10,padding:0,lineHeight:1}}>▼</button>
                </div>
              )}
              {result&&<span style={{fontSize:14}}>{it.origIdx===pbq.correct[i]?"✓":"✗"}</span>}
            </div>
          );
        })}
      </div>
      {result&&!result.correct&&(
        <div style={{marginTop:10,padding:10,background:T.greenDim,border:`1px solid ${T.green}40`,borderRadius:8}}>
          <div style={{color:T.green,fontWeight:700,fontSize:12,marginBottom:4}}>Correct order:</div>
          {pbq.correct.map((origIdx,i)=>(
            <div key={i} style={{color:T.text,fontSize:11,padding:"2px 0"}}>{i+1}. {pbq.items[origIdx]}</div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:10,marginTop:14}}>
        {!result?(
          <button onClick={submit} style={{flex:1,padding:"11px",borderRadius:8,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:700,fontSize:14}}>Submit Order</button>
        ):(
          <button onClick={reset} style={{flex:1,padding:"11px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer",fontWeight:700,fontSize:13}}>↺ Reset This PBQ</button>
        )}
      </div>
    </div>
  );
}

function MatchingPBQ({pbq,onSubmit,onReset,result}){
  const leftItems=pbq.pairs.map((p,i)=>({text:p[0],idx:i}));
  const [rightItems,setRightItems]=useState(()=>shuffleArr(pbq.pairs.map((p,i)=>({text:p[1],idx:i}))));
  const [assignments,setAssignments]=useState({}); // {leftIdx: rightItemIdx-in-array}
  const [selectedLeft,setSelectedLeft]=useState(null);

  function shuffleArr(a){const arr=[...a];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

  const pickLeft=(leftIdx)=>{
    if(result)return;
    setSelectedLeft(leftIdx===selectedLeft?null:leftIdx);
  };
  const pickRight=(rightPos)=>{
    if(result||selectedLeft===null)return;
    setAssignments(prev=>{
      const next={...prev};
      // remove this right item from any other assignment
      Object.keys(next).forEach(k=>{if(next[k]===rightPos)delete next[k];});
      next[selectedLeft]=rightPos;
      return next;
    });
    setSelectedLeft(null);
  };
  const clearAssignment=(leftIdx)=>{
    if(result)return;
    setAssignments(prev=>{const n={...prev};delete n[leftIdx];return n;});
  };

  const allAssigned=Object.keys(assignments).length===pbq.pairs.length;

  const submit=()=>{
    let allCorrect=true;
    const details=pbq.pairs.map((_,leftIdx)=>{
      const rightPos=assignments[leftIdx];
      const isCorrect=rightItems[rightPos]?.idx===leftIdx;
      if(!isCorrect)allCorrect=false;
      return isCorrect;
    });
    onSubmit(allCorrect,details);
  };
  const reset=()=>{
    setRightItems(shuffleArr(pbq.pairs.map((p,i)=>({text:p[1],idx:i}))));
    setAssignments({});setSelectedLeft(null);
    onReset();
  };

  return(
    <div>
      <div style={{padding:12,background:T.surf,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:14,fontSize:12,color:T.muted,lineHeight:1.6}}>
        📋 {pbq.instructions}
        <div style={{color:T.accent,marginTop:4,fontSize:11}}>Tap a {pbq.leftLabel} on the left, then tap its matching {pbq.rightLabel} on the right.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <div style={{color:T.muted,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>{pbq.leftLabel}</div>
          {leftItems.map(li=>{
            const assignedPos=assignments[li.idx];
            const isAssigned=assignedPos!==undefined;
            let border=selectedLeft===li.idx?T.accent:T.border;
            let bg=selectedLeft===li.idx?T.accentDim:isAssigned?T.card2:T.card;
            let col=T.text;
            if(result){
              const isCorrect=rightItems[assignedPos]?.idx===li.idx;
              border=isAssigned?(isCorrect?T.green:T.red):T.border;
              bg=isAssigned?(isCorrect?T.greenDim:T.redDim):T.card;
              col=isAssigned?(isCorrect?T.green:T.red):T.muted;
            }
            return(
              <div key={li.idx} onClick={()=>pickLeft(li.idx)} style={{padding:"9px 10px",marginBottom:6,background:bg,border:`1px solid ${border}`,borderRadius:7,cursor:result?"default":"pointer",fontSize:12,color:col,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{li.text}</span>
                {isAssigned&&!result&&<span onClick={e=>{e.stopPropagation();clearAssignment(li.idx);}} style={{color:T.muted,fontSize:10,marginLeft:6}}>✕</span>}
                {result&&isAssigned&&<span style={{fontSize:12}}>{rightItems[assignedPos]?.idx===li.idx?"✓":"✗"}</span>}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{color:T.muted,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>{pbq.rightLabel}</div>
          {rightItems.map((ri,pos)=>{
            const isUsed=Object.values(assignments).includes(pos);
            return(
              <div key={pos} onClick={()=>pickRight(pos)} style={{padding:"9px 10px",marginBottom:6,background:isUsed?T.card2:T.card,border:`1px solid ${isUsed?T.purple+"60":T.border}`,borderRadius:7,cursor:result||selectedLeft===null?"default":"pointer",fontSize:12,color:isUsed?T.purple:T.text,opacity:result?0.7:1}}>
                {ri.text}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:14}}>
        {!result?(
          <button onClick={submit} disabled={!allAssigned} style={{flex:1,padding:"11px",borderRadius:8,border:`1px solid ${allAssigned?T.accent:T.dim}`,background:allAssigned?T.accentDim:"transparent",color:allAssigned?T.accent:T.dim,cursor:allAssigned?"pointer":"default",fontWeight:700,fontSize:14}}>
            {allAssigned?"Submit Matches":`Match all items (${Object.keys(assignments).length}/${pbq.pairs.length})`}
          </button>
        ):(
          <button onClick={reset} style={{flex:1,padding:"11px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer",fontWeight:700,fontSize:13}}>↺ Reset This PBQ</button>
        )}
      </div>
    </div>
  );
}

function PBQTab(){
  const allPBQs=[...PBQ_ORDERING.map(p=>({...p,type:"order"})),...PBQ_MATCHING.map(p=>({...p,type:"match"}))];
  const [idx,setIdx]=useState(0);
  const [results,setResults]=useState({}); // {pbqId: {correct:bool}}
  const [showHint,setShowHint]=useState(false);

  const pbq=allPBQs[idx];
  const result=results[pbq.id];
  const completedCount=Object.keys(results).length;

  const handleSubmit=(correct)=>{
    setResults(prev=>({...prev,[pbq.id]:{correct}}));
  };
  const handleReset=()=>{
    setResults(prev=>{const n={...prev};delete n[pbq.id];return n;});
  };
  const goTo=(i)=>{setIdx(i);setShowHint(false);};

  return(
    <div style={{maxWidth:620,margin:"0 auto"}}>
      <div style={{padding:12,background:T.purpleDim,border:`1px solid ${T.purple}40`,borderRadius:9,marginBottom:14}}>
        <div style={{color:T.purple,fontWeight:700,fontSize:13,marginBottom:4}}>🧩 What is a PBQ?</div>
        <div style={{color:T.muted,fontSize:11,lineHeight:1.6}}>
          Performance-Based Questions appear at the START of the real A+ exam (1–10 of them). They require you to actually DO something — order steps correctly or match items — instead of picking from multiple choice. They're worth significant points and you CAN skip and return to them. Strategy: if a PBQ looks complex, mark it and come back after building momentum on multiple choice questions.
        </div>
      </div>

      {/* Navigator */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
        {allPBQs.map((p,i)=>{
          const r=results[p.id];
          let bg=idx===i?T.accentDim:T.card,border=idx===i?T.accent:T.border,col=idx===i?T.accent:T.muted;
          if(r)border=r.correct?T.green:T.red;
          return(
            <button key={p.id} onClick={()=>goTo(i)} style={{width:32,height:32,borderRadius:6,border:`2px solid ${border}`,background:bg,color:col,cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {r?(r.correct?"✓":"✗"):i+1}
            </button>
          );
        })}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{color:T.muted,fontSize:11}}>PBQ {idx+1} of {allPBQs.length} · Completed: {completedCount}/{allPBQs.length}</span>
        <Pill color={pbq.type==="order"?T.cyan:T.orange}>{pbq.type==="order"?"🔢 Ordering":"🔗 Matching"}</Pill>
      </div>

      <div style={{padding:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
          <span style={{color:T.text,fontWeight:700,fontSize:15}}>{pbq.title}</span>
        </div>
        <Pill color={T.purple}>{pbq.domain}</Pill>
      </div>

      {result&&(
        <div style={{padding:"10px 14px",borderRadius:8,marginBottom:14,background:result.correct?T.greenDim:T.redDim,border:`1px solid ${result.correct?T.green:T.red}50`,color:result.correct?T.green:T.red,fontWeight:700,fontSize:13,textAlign:"center"}}>
          {result.correct?"✓ Correct! Well done.":"✗ Not quite — review the correct answer below, then reset to try again."}
        </div>
      )}

      {pbq.type==="order"?(
        <OrderingPBQ pbq={pbq} onSubmit={handleSubmit} onReset={handleReset} result={result}/>
      ):(
        <MatchingPBQ pbq={pbq} onSubmit={handleSubmit} onReset={handleReset} result={result}/>
      )}

      {/* Prev/Next nav */}
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <button onClick={()=>goTo(Math.max(0,idx-1))} disabled={idx===0} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:idx===0?T.dim:T.muted,cursor:idx===0?"default":"pointer",fontSize:13}}>← Previous PBQ</button>
        <button onClick={()=>goTo(Math.min(allPBQs.length-1,idx+1))} disabled={idx===allPBQs.length-1} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${T.accent}50`,background:T.accentDim,color:idx===allPBQs.length-1?T.dim:T.accent,cursor:idx===allPBQs.length-1?"default":"pointer",fontSize:13,fontWeight:600}}>Next PBQ →</button>
      </div>

      {completedCount===allPBQs.length&&(
        <div style={{marginTop:16,padding:14,background:T.card,border:`1px solid ${T.green}40`,borderRadius:10,textAlign:"center"}}>
          <div style={{color:T.green,fontWeight:700,fontSize:15,marginBottom:4}}>
            🎉 All {allPBQs.length} PBQs attempted! Score: {Object.values(results).filter(r=>r.correct).length}/{allPBQs.length}
          </div>
          <div style={{color:T.muted,fontSize:11}}>Real exams typically include 1–10 PBQs. You've now practiced both formats CompTIA uses: ordering and matching.</div>
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
// React requires a class component for error boundaries (hooks can't do this).
// This is the critical safety net: if ANY single tab throws during render for
// any reason (bad data, an environment quirk, a future edit mistake), only
// that tab shows a recoverable message — the header, nav, and every other
// tab stay fully alive and clickable, instead of the entire app going blank.
class ErrorBoundary extends Component{
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return {hasError:true,error};}
  componentDidCatch(error,info){
    // Swallow logging errors too — never let error handling itself crash the app.
    try{console.error("Tab render error:",error,info);}catch(e){}
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:20,textAlign:"center",background:T.card,border:`1px solid ${T.red}50`,borderRadius:10}}>
          <div style={{fontSize:28,marginBottom:8}}>⚠️</div>
          <div style={{color:T.red,fontWeight:700,fontSize:14,marginBottom:6}}>This section had a problem loading</div>
          <div style={{color:T.muted,fontSize:12,marginBottom:14}}>Everything else in the guide is unaffected — try switching to another tab and back, or refresh the page.</div>
          <button onClick={()=>this.setState({hasError:false,error:null})} style={{padding:"8px 18px",borderRadius:7,border:`1px solid ${T.accent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontWeight:600,fontSize:12}}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App(){
  const [tab,setTab]=useState("overview");
  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Segoe UI',system-ui,sans-serif",overflowX:"hidden"}}>
      {/* HEADER */}
      <div style={{background:"#050e1a",borderBottom:`2px solid ${T.accent}30`,padding:"10px 12px 0",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontWeight:900,fontSize:18,background:`linear-gradient(90deg,${T.accent},${T.purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CompTIA A+</span>
            <span style={{background:T.redDim,color:T.red,border:`1px solid ${T.red}50`,borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>220-1201 / 1202</span>
            <span style={{background:T.greenDim,color:T.green,border:`1px solid ${T.green}50`,borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>V15 · 2025</span>
          </div>
          <div style={{display:"flex",gap:8,fontSize:10,color:T.muted}}>
            <span>Need <b style={{color:T.text}}>675</b>/900 (C1)</span>
            <span>Need <b style={{color:T.text}}>700</b>/900 (C2)</span>
            <span><b style={{color:T.yellow}}>90Q · 90min</b></span>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{display:"flex",gap:0,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",paddingBottom:0}}>
          {MAIN_TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 12px 5px",border:"none",cursor:"pointer",borderRadius:"6px 6px 0 0",flexShrink:0,background:tab===t.id?T.card:"transparent",color:tab===t.id?T.accent:T.muted,fontWeight:tab===t.id?700:400,fontSize:11,whiteSpace:"nowrap",borderBottom:tab===t.id?`2px solid ${T.accent}`:"2px solid transparent",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span>{t.label}</span>
              {t.exam!=="both"&&<span style={{fontSize:7,fontWeight:800,letterSpacing:0.4,color:EXAM_BADGE_COLOR[t.exam],background:EXAM_BADGE_COLOR[t.exam]+"22",padding:"1px 5px",borderRadius:3}}>{EXAM_BADGE_LABEL[t.exam]}</span>}
            </button>
          ))}
        </div>
      </div>
      {/* CONTENT */}
      <div style={{padding:"14px 10px 50px",maxWidth:900,margin:"0 auto"}}>
        {tab==="overview"   &&<ErrorBoundary><OverviewTab/></ErrorBoundary>}
        {tab==="lessons"    &&<ErrorBoundary><LessonsTab/></ErrorBoundary>}
        {tab==="glossary"   &&<ErrorBoundary><GlossaryTab/></ErrorBoundary>}
        {tab==="mobile"     &&<ErrorBoundary><MobileTab/></ErrorBoundary>}
        {tab==="ports"      &&<ErrorBoundary><PortsTab/></ErrorBoundary>}
        {tab==="hardware"   &&<ErrorBoundary><HardwareTab/></ErrorBoundary>}
        {tab==="commands"   &&<ErrorBoundary><CommandsTab/></ErrorBoundary>}
        {tab==="subnetting" &&<ErrorBoundary><SubnettingTab/></ErrorBoundary>}
        {tab==="security"   &&<ErrorBoundary><SecurityTab/></ErrorBoundary>}
        {tab==="os"         &&<ErrorBoundary><OsTab/></ErrorBoundary>}
        {tab==="ops"        &&<ErrorBoundary><OpsTab/></ErrorBoundary>}
        {tab==="flashcards" &&<ErrorBoundary><FlashcardsTab/></ErrorBoundary>}
        {tab==="exam"       &&<ErrorBoundary><ExamTab/></ErrorBoundary>}
        {tab==="pbq"        &&<ErrorBoundary><PBQTab/></ErrorBoundary>}
      </div>
      {/* FOOTER */}
      <div style={{textAlign:"center",padding:"10px",color:T.muted,fontSize:10,borderTop:`1px solid ${T.border}`}}>
        CompTIA A+ 220-1201/1202 · Core 1 pass: 675/900 · Core 2 pass: 700/900 · All corrections applied · 2025
      </div>
    </div>
  );
}
