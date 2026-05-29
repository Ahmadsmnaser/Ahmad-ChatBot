# Projects

---

## HawkAlloc — Custom Memory Allocator (C, Linux)

**Description:** A custom heap allocator written in C on Linux.

**Problem solved:** Recreates core dynamic memory allocation behavior to understand how allocation, freeing, resizing, fragmentation, and heap growth work under the hood.

**Ahmad's role:** Sole author — design and implementation.

**Technologies:** C, Linux, `mmap`.

**Key technical details:**
- Custom `malloc`, `free`, `realloc`, and `calloc` behavior.
- Memory sourcing using `mmap`.
- Free-list management.
- Block splitting.
- Free block coalescing.
- Alignment handling.
- Edge-case testing.

**What it proves:** Strong low-level C ability, understanding of pointers, memory layout, fragmentation, and allocator design.

**Recruiter-facing explanation:** Ahmad built his own memory allocator in C, showing he understands what happens beneath standard allocation APIs like `malloc`.

**GitHub:** https://github.com/Ahmadsmnaser/hawkalloc

---

## SysPeek — ptrace-Based Linux Syscall Tracer (C, Linux)

**Description:** A Linux syscall tracer built on `ptrace`, similar in spirit to a minimal `strace`.

**Problem solved:** Observes and decodes system calls made by a running process.

**Ahmad's role:** Sole author.

**Technologies:** C, Linux, `ptrace`, x86_64.

**Key technical details:**
- Uses `PTRACE_TRACEME` and syscall stop handling.
- Captures syscall numbers and arguments.
- Reads x86_64 registers.
- Captures return values.
- Detects syscall errors.
- Formats syscall traces clearly.

**What it proves:** Strong understanding of the user/kernel boundary, process tracing, syscall ABI, Linux internals, and register-level behavior.

**Recruiter-facing explanation:** Ahmad wrote a ptrace-based syscall tracer that decodes syscall arguments, return values, and register state, showing real OS-level understanding.

**GitHub:** https://github.com/Ahmadsmnaser/Syspeek-Syscall-Tracing-Tool

---

## SchedScope — Linux Kernel Scheduler Experimentation Framework (C, QEMU)

**Description:** A framework for experimenting with and instrumenting the Linux kernel scheduler.

**Problem solved:** Makes Linux scheduler behavior observable under controlled workloads.

**Ahmad's role:** Sole author.

**Technologies:** C, Linux kernel, QEMU, ftrace, `trace_printk`, CFS scheduler.

**Key technical details:**
- Booted and tested a custom Linux kernel in QEMU.
- Studied the scheduler path, including CFS/EEVDF-related behavior.
- Instrumented scheduler code with tracing.
- Collected workload metrics such as runtime, fairness, context switches, and preemptions.
- Measured scheduler behavior changes under controlled experiment workloads.

**What it proves:** Ability to build, run, inspect, and instrument Linux kernel behavior; strong systems curiosity; quantitative performance-analysis mindset.

**Recruiter-facing explanation:** Ahmad built a kernel scheduler experimentation framework in QEMU, instrumented scheduler behavior, and analyzed measurable runtime and fairness metrics.

**GitHub:** https://github.com/Ahmadsmnaser/SchedScope-Linux-Kernel-Scheduler

---

## Mini Scheduler Simulator (C)

**Description:** A deterministic userspace scheduling simulator.

**Problem solved:** Models scheduling policies without the complexity of modifying a real kernel.

**Ahmad's role:** Sole author.

**Technologies:** C, C11.

**Key technical details:**
- Deterministic Round-Robin scheduling.
- Fair scheduling simulation.
- Trace-driven workloads.
- Metrics such as turnaround time, waiting time, and fairness.

**What it proves:** Scheduling theory, clean C implementation, deterministic testing, and ability to compare algorithms quantitatively.

**Recruiter-facing explanation:** Ahmad built a scheduler simulator in C to model and compare scheduling policies with trace-driven metrics.

**GitHub:** https://github.com/Ahmadsmnaser/Mini-Scheduler

---

## CUDA Performance Suite (CUDA, C++)

**Description:** A set of GPU performance experiments and benchmarks.

**Problem solved:** Understands GPU memory behavior, kernel performance, and optimization trade-offs.

**Ahmad's role:** Sole author.

**Technologies:** CUDA, C++, cuBLAS, Nsight.

**Key technical details:**
- Matrix multiplication benchmarks.
- Naive CUDA kernel.
- Tiled shared-memory CUDA kernel.
- cuBLAS comparison.
- GPU memory-bandwidth benchmarking.
- Access-pattern experiments.
- Focus on memory coalescing and performance measurement.

**What it proves:** Practical CUDA/GPU performance learning, benchmarking discipline, and ability to compare custom kernels against industrial baselines like cuBLAS.

**Recruiter-facing explanation:** Ahmad benchmarks his CUDA kernels against cuBLAS and measures memory behavior across access patterns, showing performance-engineering instincts.

**GitHub:** https://github.com/Ahmadsmnaser/GPU-Memory-Bandwidth-Benchmarker
**GitHub:** https://github.com/Ahmadsmnaser/Matrix-Multiplication---CUDA

---

## cuRAG — GPU-Accelerated Vector Search (In Progress)

**Description:** A CUDA-based vector similarity search project.

**Problem solved:** Explores faster vector retrieval for RAG-like workloads.

**Ahmad's role:** Sole author.

**Technologies:** CUDA, C++.

**Key technical details:**
- Custom similarity kernels.
- GPU-based vector comparison.
- Intended benchmarking against FAISS-GPU.
- Connects CUDA/performance work with AI/RAG systems.

**Status:** In progress. This project should not be presented as completed production work.

**What it proves:** Ahmad is combining his low-level/GPU interests with modern AI/RAG infrastructure.

**Recruiter-facing explanation:** Ahmad is building a CUDA vector-search project to connect GPU performance engineering with retrieval workloads.

**GitHub:** https://github.com/Ahmadsmnaser/CUDA-RAG

---

## Ahmad's ChatBot — Full-Stack RAG Application

**Description:** A full-stack AI chatbot with RAG, authentication, persistent chat history, user settings, public profile assistant direction, and source citations.

**Problem solved:** Lets users chat with an AI assistant and ask grounded questions over uploaded files. The project is also being shaped into Ahmad’s public AI portfolio assistant.

**Ahmad's role:** Sole author — frontend, backend, auth, database, and RAG pipeline.

**Technologies:** Next.js, React, TypeScript, FastAPI, Python, Google Auth, SQLAlchemy, PostgreSQL, LangChain, Groq, Chroma, embeddings.

**Key technical details:**
- Google OAuth sign-in.
- Per-user chat history.
- DB-backed settings.
- Streaming responses over SSE.
- File upload for PDF/TXT/MD.
- RAG pipeline with citations.
- Multiple answer modes.
- Deployment-oriented architecture.
- Public “Ask About Ahmad” direction using verified profile data.

**What it proves:** Full-stack product ability, backend API design, auth, database design, RAG integration, AI application development, and product thinking.

**Recruiter-facing explanation:** Ahmad built a full-stack RAG chatbot with auth, database persistence, file upload, streaming responses, and cited answers.

**GitHub:** https://github.com/Ahmadsmnaser/Ahmad-ChatBot

---

## Software Delivery AI Agents — Internship Project

**Description:** Internal AI agents designed to support and automate parts of the software delivery workflow.

**Problem solved:** Reduces manual work around task handling, change preparation, branch creation, commit organization, and merge request documentation.

**Ahmad's role:** Built the first agent and was responsible for 3 agents out of a planned 12-agent workflow.

**Technologies:** AI agents, LangGraph, LangChain, OpenRouter API, GitLab automation, repository change analysis, workflow orchestration.

**Key technical details:**
- The larger workflow is designed to move from task intake to merge request preparation.
- The first implemented agent inspects repository changes.
- Creates a dedicated branch.
- Prepares a pull/merge request.
- Writes a detailed summary of the changes.
- Organizes commits by change type.
- Helps standardize and clarify software delivery changes for review.

**What it proves:** Practical AI-agent engineering in a real workplace, with direct connection to developer productivity and software delivery automation.

**Recruiter-facing explanation:** Ahmad built an internal AI agent that analyzes code changes, creates a branch, prepares a merge request, and documents changes in a structured way — showing practical AI-agent development beyond demos.

---

## xv6 Kernel Extensions (C, RISC-V, QEMU)

**Description:** Extensions and OS exercises using the xv6 teaching operating system.

**Problem solved:** Implements and understands operating-system primitives from the inside.

**Ahmad's role:** Author through coursework and self-study.

**Technologies:** C, xv6, RISC-V, QEMU.

**Key technical details:**
- Custom syscalls.
- Synchronization concepts.
- Shared memory and page-table concepts.
- Kernel-level programming exercises.

**What it proves:** Practical exposure to OS internals, syscalls, virtual memory, and synchronization.

**Recruiter-facing explanation:** Ahmad worked directly with xv6 kernel mechanisms, reinforcing his low-level and OS foundations.

**GitHub:** https://github.com/Ahmadsmnaser/Operating-Systems

---

## Personal Portfolio Website

**Description:** Ahmad's personal portfolio website presenting his systems-first engineering profile.

**Ahmad's role:** Author.

**Technologies:** Next.js, React, Tailwind CSS, Vercel.

**What it proves:** Ability to present technical work clearly and build/deploy frontend projects.

**Link:** https://personal-websiteahmad.vercel.app/

**GitHub:** https://github.com/Ahmadsmnaser/personal-website_ahmad