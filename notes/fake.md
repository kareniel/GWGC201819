# Fake

emulator:

```
Ret=00000000
[SYSCALL] (35, NtQueryVirtualMemory)
  Arg0=0xFFFFFFFFFFFFFFFF    Arg1=0x0000000000000000
  Ret=00000000 
[SYSCALL] (35, NtQueryVirtualMemory)
  Arg0=0xFFFFFFFFFFFFFFFF    Arg1=0x0000000000000000
  Ret=00000000 
[SYSCALL] (35, NtQueryVirtualMemory)
  Arg0=0xFFFFFFFFFFFFFFFF    Arg1=0x0000000000000000
  Ret=00000000 

Emulator has exited (err=0). Investigate state and press ENTER to quit
```

logs:

```
1d04:2404 @ 27498875 - LdrLoadDll - ENTER: DLL name: api-ms-win-core-synch-11-2-0
```

registers:

```
RAX=000000000000002c RBX=000000000000002c
RDX=000000000000002c RSI=000000000000002c
IOPL=0
CS=0000 SS=0000 ES=0000
```


boot:

```
Copyright (c) 2560-2561 The Galaxian Mining Corporation
VT(vga): resolution 1080x720
CPU: Intel(R) Core(TM) i7-8911 CPU @ 3.2GHz (3591.98-MHz K8-class)
OV.PAT
PCNT
VPCID,RTM
real memory = 12394292
avail memory = 1283912

```

exec:

```
[+] Generating CG for '' -> 0x8372f83e21...
[0] Basic Block [0x8ffee78bb - 0x87ff12a78bb]
[+] Done
```

