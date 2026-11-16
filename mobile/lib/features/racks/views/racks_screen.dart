import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';
import 'package:rack_monitoring/features/racks/views/widgets/rack_card.dart';
import 'package:rack_monitoring/shared/widgets/message_state.dart';
import 'package:rack_monitoring/shared/widgets/relative_time.dart';

const _statusFilters = [null, RackStatus.warning, RackStatus.alarm, RackStatus.offline];

class RacksScreen extends ConsumerStatefulWidget {
  const RacksScreen({super.key});

  @override
  ConsumerState<RacksScreen> createState() => _RacksScreenState();
}

class _RacksScreenState extends ConsumerState<RacksScreen> {
  final _searchController = SearchController();
  RackStatus? _status;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final summaries = ref.watch(rackSummariesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Racks'), actions: const [UserMenuButton()]),
      body: switch (summaries) {
        AsyncData(:final value) => _buildList(value),
        AsyncError() => MessageState(
          icon: Icons.cloud_off,
          title: 'No se pudieron cargar los racks',
          description: 'Revisa tu conexión e inténtalo de nuevo.',
          action: FilledButton.tonal(
            onPressed: () => ref.invalidate(rackSummariesProvider),
            child: const Text('Reintentar'),
          ),
        ),
        AsyncLoading() => const Center(child: CircularProgressIndicator()),
      },
    );
  }

  Widget _buildList(List<RackSummary> summaries) {
    final theme = Theme.of(context);
    final visible = sortRacksByUrgency(filterRacks(summaries, search: _searchController.text, status: _status));
    final updatedAt = lastUpdate(summaries);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: SearchBar(
            controller: _searchController,
            hintText: 'Buscar por nombre o ubicación',
            leading: const Icon(Icons.search),
            elevation: const WidgetStatePropertyAll(0),
            onChanged: (_) => setState(() {}),
            trailing: [
              if (_searchController.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Borrar búsqueda',
                  onPressed: () => setState(_searchController.clear),
                ),
            ],
          ),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            spacing: 8,
            children: [
              for (final status in _statusFilters)
                FilterChip(
                  label: Text(status?.label ?? 'Todos'),
                  selected: _status == status,
                  onSelected: (_) => setState(() => _status = status),
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${visible.length} de ${summaries.length} racks', style: theme.textTheme.bodySmall),
              if (updatedAt != null) RelativeTime(updatedAt, prefix: 'Actualizado ', style: theme.textTheme.bodySmall),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.refresh(rackSummariesProvider.future),
            child: visible.isEmpty
                // Scrollable so pull to refresh also works on the empty state
                ? LayoutBuilder(
                    builder: (context, constraints) => SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: SizedBox(
                        height: constraints.maxHeight,
                        child: const MessageState(
                          icon: Icons.dns_outlined,
                          title: 'No hay racks para mostrar',
                          description: 'Prueba con otra búsqueda o con otro estado.',
                        ),
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: visible.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) => RackCard(visible[index]),
                  ),
          ),
        ),
      ],
    );
  }
}
